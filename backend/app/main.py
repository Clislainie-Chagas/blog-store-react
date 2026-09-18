
from fastapi import FastAPI

from app.database import Base, engine
from app import models
from fastapi.middleware.cors import CORSMiddleware
from app.product_routes import router as product_router
from app.admin_routes import router as admin_router
from app.order_routes import router as order_router
from app.payment_routes import router as payment_router

app = FastAPI()

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

@app.get("/")
def home():
    return {
        "message": "API Arte da Magia funcionando!"
    }