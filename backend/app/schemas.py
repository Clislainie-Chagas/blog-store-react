from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    name: str
    category: str
    product_type: str = "physical"
    price: Decimal
    image: str | None = None
    description: str | None = None
    stock: int = 0

    weight: Decimal | None = None
    length: Decimal | None = None
    width: Decimal | None = None
    height: Decimal | None = None

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
    shipping_complement: str | None = None

    shipping_service_id: int | None = None
    shipping_service_name: str | None = None
    shipping_company: str | None = None
    shipping_price: Decimal = Decimal("0.00")
    shipping_delivery_min: int | None = None
    shipping_delivery_max: int | None = None

    items: list[OrderItemCreate]


class OrderItemProductResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    product: OrderItemProductResponse

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
    shipping_complement: str | None = None

    shipping_service_id: int | None = None
    shipping_service_name: str | None = None
    shipping_company: str | None = None
    shipping_price: Decimal = Decimal("0.00")
    shipping_delivery_min: int | None = None
    shipping_delivery_max: int | None = None

    total: Decimal
    status: str

    payment_status: str
    payment_method: str | None = None
    payment_provider: str | None = None
    payment_reference: str | None = None
    
    created_at: datetime
    items: list[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)


# =========================
# BLOG
# =========================

class BlogPostCreate(BaseModel):
    title: str
    slug: str
    summary: str
    content: str
    category: str
    image_url: str | None = None
    published: bool = False


class BlogPostUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    summary: str | None = None
    content: str | None = None
    category: str | None = None
    image_url: str | None = None
    published: bool | None = None


class BlogPostResponse(BaseModel):
    id: int
    title: str
    slug: str
    summary: str
    content: str
    category: str
    image_url: str | None = None
    published: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)