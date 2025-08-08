from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from routes.productos_routes import router_productos
from routes.webpay_routes import router as webpay_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Permitir solo el frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# por ahora ningun prefix 
app.include_router(router)
app.include_router(router_productos)
app.include_router(webpay_router)

