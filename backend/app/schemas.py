from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    name: str
    category: str
    price: Decimal
    image: str | None = None
    description: str | None = None
    stock: int = 0


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class AdminCreate(BaseModel):
    name: str
    email: str
    password: str


class AdminLogin(BaseModel):
    email: str
    password: str


class AdminResponse(BaseModel):
    id: int
    name: str
    email: str

    model_config = ConfigDict(from_attributes=True)

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str | None = None

    shipping_cep: str | None = None
    shipping_state: str | None = None
    shipping_city: str | None = None
    shipping_street: str | None = None
    shipping_number: str | None = None

    items: list[OrderItemCreate]


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    customer_name: str
    customer_email: str
    customer_phone: str | None = None

    shipping_cep: str | None = None
    shipping_state: str | None = None
    shipping_city: str | None = None
    shipping_street: str | None = None
    shipping_number: str | None = None

    total: Decimal
    status: str

    payment_status: str
    payment_method: str | None = None
    payment_provider: str | None = None
    payment_reference: str | None = None
    
    created_at: datetime
    items: list[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)