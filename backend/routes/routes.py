import json
import urllib
from fastapi import APIRouter, Depends, HTTPException, status, Request, Body, Response, Cookie
from starlette.responses import RedirectResponse
from schemas import schemas
import database
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
import os
from passlib.context import CryptContext
from bson import ObjectId
import httpx
from urllib.parse import urlencode
from datetime import datetime, timedelta
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Cargar variables de entorno del archivo .env
load_dotenv()

# rutas principales para el usuario como tal

SECRET_KEY = os.environ.get("SECRET_KEY", "secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Token expira en 30 minutos
REFRESH_TOKEN_EXPIRE_DAYS = 7  # Refresh token dura 7 días

# Google OAuth config
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")


router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

async def get_user_collection():
    return database.db["users"]

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), user_collection=Depends(get_user_collection)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await user_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    user["id"] = str(user["_id"])
    return user

# Nueva función para extraer el JWT desde la cookie
async def get_current_user_from_cookie(access_token: str = Cookie(None), user_collection=Depends(get_user_collection)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not access_token:
        raise credentials_exception
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await user_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    user["id"] = str(user["_id"])
    return user


@router.post("/register", response_model=schemas.User)
async def register(user: schemas.UserCreate, user_collection=Depends(get_user_collection)):
    existing = await user_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    user_doc = {
        "email": user.email,
        "hashed_password": hashed_password,
        "full_name": user.full_name,
        "google_id": None
    }
    result = await user_collection.insert_one(user_doc)
    user_doc["id"] = str(result.inserted_id)
    return schemas.User(**user_doc)

# Reemplazar el endpoint de login para usar cookies HttpOnly
@router.post("/login")
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), user_collection=Depends(get_user_collection)):
    user = await user_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = create_access_token({"sub": user["email"]})
    refresh_token = create_refresh_token({"sub": user["email"]})
    # Setea el JWT en una cookie HttpOnly
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Cambiar esto a True en producción con HTTPS
        samesite="lax"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Cambiar esto a True en producción con HTTPS
        samesite="lax"
    )
    return {"message": "Login exitoso"}

@router.get("/auth/google")
async def google_auth():
    # Inicia el flujo de OAuth con Google
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline"
    }
    
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return {"auth_url": auth_url}

@router.get("/auth/google/callback")
async def google_callback(code: str, user_collection=Depends(get_user_collection)):
    # Callback de Google OAuth
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    # Intercambiar código por token de acceso
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": GOOGLE_REDIRECT_URI
    }
    
    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)
        token_info = token_response.json()
        
        if "error" in token_info:
            raise HTTPException(status_code=400, detail=f"Token error: {token_info['error']}")
        
        access_token = token_info["access_token"]
        
        # Obtener información del usuario
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        user_response = await client.get(user_info_url, headers=headers)
        user_info = user_response.json()
        
        # Buscar o crear usuario
        existing_user = await user_collection.find_one({"email": user_info["email"]})
        
        if existing_user:
            # Usuario existe, actualizar google_id si es necesario
            if not existing_user.get("google_id"):
                await user_collection.update_one(
                    {"email": user_info["email"]},
                    {"$set": {"google_id": user_info["id"]}}
                )
            user_id = str(existing_user["_id"])
        else:
            # Crear nuevo usuario
            new_user = {
                "email": user_info["email"],
                "full_name": user_info.get("name", ""),
                "google_id": user_info["id"],
                "hashed_password": None  # Usuario de Google no tiene password
            }
            result = await user_collection.insert_one(new_user)
            user_id = str(result.inserted_id)
        
        # Crear JWT token
        jwt_token = create_access_token({"sub": user_info["email"]})
        refresh_token = create_refresh_token({"sub": user_info["email"]})
        
        frontend_url = "http://localhost:3000/auth/callback"
        
        user_data = {
            "id": user_id,
            "email": user_info["email"],
            "full_name": user_info.get("name", ""),
            "google_id": user_info["id"]
        }
        params = {
            "access_token": jwt_token,
            "refresh_token": refresh_token,
            "user": urllib.parse.quote(json.dumps(user_data))
        }
        redirect_url = f"{frontend_url}?access_token={params['access_token']}&refresh_token={params['refresh_token']}&user={params['user']}"
        return RedirectResponse(redirect_url)



# Endpoint para refrescar el token, hay como dos token, uno de acceso y otro de refresco(este dura mas) y ese se pasa aqui
# para verificar que el usuario sigue logueado y se le genera un nuevo token de acceso en caso de que se alla salido o acabado
@router.post("/refresh")
async def refresh_token_endpoint(body: schemas.RefreshTokenRequest, user_collection=Depends(get_user_collection)):
    refresh_token = body.refresh_token
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await user_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    access_token = create_access_token({"sub": email})
    return {"access_token": access_token, "token_type": "bearer"}


# Modificar el endpoint /me para usar la cookie
@router.get("/me")
async def read_users_me(current_user=Depends(get_current_user_from_cookie)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "full_name": current_user.get("full_name"),
        "google_id": current_user.get("google_id")
    }

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return {"message": "Sesión cerrada"}

@router.post("/auth/set-cookie")
async def set_google_cookie(response: Response, body: dict = Body(...)):
    access_token = body.get("access_token")
    refresh_token = body.get("refresh_token")
    if not access_token or not refresh_token:
        raise HTTPException(status_code=400, detail="Tokens faltantes")
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # True en producción
        samesite="lax"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax"
    )
    return {"message": "Cookie seteada"}


