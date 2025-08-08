from fastapi import APIRouter, HTTPException
from schemas.productos_schemas import Product
import requests
import re
import random

router_productos = APIRouter()

# Productosde ejemplo para mostrar
SAMPLE_PRODUCTS = [
    {
        "id": "1",
        "name": "Hamburguesa Clásica",
        "description": "Hamburguesa con carne de res, lechuga, tomate, queso y salsa especial",
        "price": 8500,
        "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58e9?w=400&h=400&fit=crop",
        "category": "Hamburguesas"
    },
    {
        "id": "2",
        "name": "Pizza Margherita",
        "description": "Pizza tradicional con salsa de tomate, mozzarella y albahaca fresca",
        "price": 12000,
        "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=400&fit=crop",
        "category": "Pizzas"
    },
    {
        "id": "3",
        "name": "Ensalada César",
        "description": "Lechuga romana, crutones, parmesano y aderezo César",
        "price": 6500,
        "image_url": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=400&fit=crop",
        "category": "Ensaladas"
    },
    {
        "id": "4",
        "name": "Pasta Carbonara",
        "description": "Pasta con salsa cremosa, panceta, huevo y queso parmesano",
        "price": 9500,
        "image_url": "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=400&fit=crop",
        "category": "Pastas"
    },
    {
        "id": "5",
        "name": "Sushi Roll California",
        "description": "Roll de sushi con aguacate, pepino y cangrejo",
        "price": 15000,
        "image_url": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop",
        "category": "Sushi"
    },
    {
        "id": "6",
        "name": "Tacos al Pastor",
        "description": "Tacos con carne de cerdo marinada, piña y cilantro",
        "price": 7500,
        "image_url": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop",
        "category": "Tacos"
    },
    {
        "id": "7",
        "name": "Sopa de Tomate",
        "description": "Sopa cremosa de tomate con albahaca y crutones",
        "price": 5500,
        "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop",
        "category": "Sopas"
    },
    {
        "id": "8",
        "name": "Tiramisú",
        "description": "Postre italiano con café, mascarpone y cacao",
        "price": 4500,
        "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop",
        "category": "Postres"
    }
]

## Rutas de productos
@router_productos.get("/products", response_model=list[Product])
async def get_products():
    """lista de productos para mostrar"""
    return [Product(**product) for product in SAMPLE_PRODUCTS]

#obtiene las categorías disponibles
@router_productos.get("/products/categories")
async def get_categories():
    categories = list(set(product["category"] for product in SAMPLE_PRODUCTS))
    return {"categories": categories}

#filtrar productos por categoría
@router_productos.get("/products/category/{category}")
async def get_products_by_category(category: str):
    filtered_products = [p for p in SAMPLE_PRODUCTS if p["category"].lower() == category.lower()]
    return [Product(**product) for product in filtered_products]

## Funciones para consumir API externa y extrar datos de productos
def get_product_data(barcode):
    url = f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json().get("product", None)
    else:
        return None

#intento de obtener imagen desde API externa
def get_image_url(product_data, image_name, resolution="400"):
    if image_name not in product_data["images"]:
        return None

    base_url = "https://images.openfoodfacts.org/images/products"
    barcode = product_data["code"]

    if len(barcode) < 13:
        barcode = barcode.zfill(13)
    folder_name = re.sub(r'(...)(...)(...)(.*)', r'\1/\2/\3/\4', barcode)

    image_info = product_data["images"][image_name]
    if image_name.isdigit():
        resolution_suffix = "" if resolution == "full" else f".{resolution}"
        filename = f"{image_name}{resolution_suffix}.jpg"
    else:
        rev = image_info["rev"]
        filename = f"{image_name}.{rev}.{resolution}.jpg"

    return f"{base_url}/{folder_name}/{filename}"


#intento de consumir API externa
@router_productos.get("/products/{barcode}", response_model=Product)
async def get_product_by_barcode(barcode: str):
    product_data = get_product_data(barcode)
    if not product_data:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Buscar imagen frontal en español, luego en inglés, si no hay, placeholder
    image_url = get_image_url(product_data, "front_es", "400")
    if not image_url:
        image_url = get_image_url(product_data, "front_en", "400")
    if not image_url:
        image_url = "https://via.placeholder.com/400x400?text=No+Image"

    # Generar precio random
    random_price = random.randint(5000, 30000)

    product = Product(
        id=barcode,
        name=product_data.get("product_name", "Nombre desconocido"),
        description=product_data.get("generic_name", "Sin descripción"),
        price=random_price,
        image_url=image_url
    )
    return product
