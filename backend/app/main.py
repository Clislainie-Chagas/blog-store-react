
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app import models
from fastapi.middleware.cors import CORSMiddleware
from app.product_routes import router as product_router
from app.admin_routes import router as admin_router
from app.order_routes import router as order_router
from app.payment_routes import router as payment_router
from app.contact_routes import router as contact_router
from app.shipping_routes import router as shipping_router
from app.blog_routes import router as blog_router

app = FastAPI()

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(product_router)
app.include_router(admin_router)
app.include_router(order_router)
app.include_router(payment_router)
app.include_router(contact_router)
app.include_router(shipping_router)
app.include_router(blog_router)

@app.get("/")
def home():
    
    return {
        "message": "API Arte da Magia funcionando!"
    }