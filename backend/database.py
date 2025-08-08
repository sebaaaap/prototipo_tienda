import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

MONGODB_URL = os.getenv("DATABASE_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)

# Extraer el nombre de la base de datos desde la URL
parsed = urlparse(MONGODB_URL)
if parsed.path and parsed.path != "/":
    db_name = parsed.path[1:]
else:
    db_name = "testdb"

db = client[db_name]

# Helper para obtener la colección de usuarios
async def get_user_collection():
    return db["users"]
