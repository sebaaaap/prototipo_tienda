
from pydantic import BaseModel

class Product(BaseModel):
    id: str
    name: str
    description: str
    price: float
    image_url: str
    category: str