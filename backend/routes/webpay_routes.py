import os
import json
import hmac
import hashlib
import base64
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel
import httpx
from database import db
from dotenv import load_dotenv

# Cargar variables de entorno del archivo .env
load_dotenv()

router = APIRouter()

# Configuración de WebPay
WEBPAY_CONFIG = {
    "commerce_code": os.getenv("WEBPAY_COMMERCE_CODE", "597055555532"),
    "api_key": os.getenv("WEBPAY_API_KEY", "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C"),
    "base_url": "https://webpay3gint.transbank.cl" if os.getenv("WEBPAY_ENVIRONMENT") != "LIVE" else "https://webpay3g.transbank.cl"
}


## modelos que debo mover luego a la carpeta
class PaymentRequest(BaseModel):
    amount: int
    buy_order: Optional[str] = None
    session_id: Optional[str] = None

class PaymentResponse(BaseModel):
    success: bool
    payment_url: Optional[str] = None
    token: Optional[str] = None
    error: Optional[str] = None

def create_hmac_signature(message: str, secret_key: str) -> str:
    """Crear firma HMAC para WebPay"""
    signature = hmac.new(
        secret_key.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).digest()
    return base64.b64encode(signature).decode('utf-8')


# inicia el proceso de pago
@router.post("/api/create-payment", response_model=PaymentResponse)
async def create_payment(request: PaymentRequest):

    try:
        # Validación básica
        if not request.amount or request.amount <= 0:
            raise HTTPException(status_code=400, detail="Monto inválido")

        # Generar datos de la transacción
        buy_order = request.buy_order or f"ORDER{int(datetime.now().timestamp())}"
        session_id = request.session_id or f"SESS{int(datetime.now().timestamp())}"
        
        # URL de retorno (debe ser una ruta de tu frontend siosi)
        return_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/payment-result"

        # Datos de la transacción
        transaction_data = {
            "buy_order": buy_order,
            "session_id": session_id,
            "amount": request.amount,
            "return_url": return_url
        }

        # URL de la API de WebPay
        url = f"{WEBPAY_CONFIG['base_url']}/rswebpaytransaction/api/webpay/v1.2/transactions"
        
        # Headers requeridos
        headers = {
            "Tbk-Api-Key-Id": WEBPAY_CONFIG["commerce_code"],
            "Tbk-Api-Key-Secret": WEBPAY_CONFIG["api_key"],
            "Content-Type": "application/json"
        }

        # Realizar petición a WebPay
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=transaction_data, headers=headers)
            
            if response.status_code == 200:
                response_data = response.json()
                
                # Guardar información de la transacción en la base de datos
                transaction_record = {
                    "buy_order": buy_order,
                    "session_id": session_id,
                    "amount": request.amount,
                    "token": response_data.get("token"),
                    "status": "pending",
                    "created_at": datetime.now(),
                    "webpay_response": response_data
                }
                
                await db["transactions"].insert_one(transaction_record)
                
                return PaymentResponse(
                    success=True,
                    payment_url=response_data.get("url"),
                    token=response_data.get("token")
                )
            else:
                error_data = response.json() if response.content else {"error": "Unknown error"}
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error en WebPay: {error_data}"
                )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en WebPay: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor al procesar el pago"
        )


## esto me lo sugerio gpt- analizar con mas detalle...
@router.post("/api/webpay/commit")
async def commit_payment(request: Request):
    """Endpoint para recibir la confirmación de WebPay"""
    try:
        # Obtener datos del POST de WebPay
        form_data = await request.form()
        token_ws = form_data.get("token_ws")
        
        if not token_ws:
            raise HTTPException(status_code=400, detail="Token no proporcionado")

        # URL para consultar el estado de la transacción
        url = f"{WEBPAY_CONFIG['base_url']}/rswebpaytransaction/api/webpay/v1.2/transactions/{token_ws}"
        
        headers = {
            "Tbk-Api-Key-Id": WEBPAY_CONFIG["commerce_code"],
            "Tbk-Api-Key-Secret": WEBPAY_CONFIG["api_key"],
            "Content-Type": "application/json"
        }

        # Consultar estado de la transacción
        async with httpx.AsyncClient() as client:
            response = await client.put(url, headers=headers)
            
            if response.status_code == 200:
                transaction_data = response.json()
                
                # Actualizar transacción en la base de datos
                await db["transactions"].update_one(
                    {"token": token_ws},
                    {
                        "$set": {
                            "status": transaction_data.get("status"),
                            "response_code": transaction_data.get("response_code"),
                            "response_description": transaction_data.get("response_description"),
                            "updated_at": datetime.now(),
                            "commit_response": transaction_data
                        }
                    }
                )
                
                # Redirigir según el resultado
                if transaction_data.get("status") == "AUTHORIZED":
                    return Response(
                        content=f"""
                        <html>
                        <head><title>Pago Exitoso</title></head>
                        <body>
                        <script>
                            window.location.href = '{os.getenv("FRONTEND_URL", "http://localhost:3000")}/payment-result?status=success&token={token_ws}';
                        </script>
                        </body>
                        </html>
                        """,
                        media_type="text/html"
                    )
                else:
                    return Response(
                        content=f"""
                        <html>
                        <head><title>Pago Fallido</title></head>
                        <body>
                        <script>
                            window.location.href = '{os.getenv("FRONTEND_URL", "http://localhost:3000")}/payment-result?status=failure&token={token_ws}';
                        </script>
                        </body>
                        </html>
                        """,
                        media_type="text/html"
                    )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Error al consultar estado de la transacción"
                )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en commit payment: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )
        
#me lo sugerio gpt- analizar con mas detalle...
@router.get("/api/transactions/{token}")
async def get_transaction_status(token: str):
    try:
        transaction = await db["transactions"].find_one({"token": token})
        if not transaction:
            raise HTTPException(status_code=404, detail="Transacción no encontrada")
        
        # Remover campos sensibles
        transaction.pop("_id", None)
        return transaction
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error obteniendo transacción: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )