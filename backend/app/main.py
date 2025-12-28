from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, users, menu_items, orders, tables, payments, settings as settings_router, work_logs, staff_profiles, coupons, recommendations, marketing
from app.websocket.connection_manager import ConnectionManager

# WebSocket connection manager
manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: cleanup if needed

app = FastAPI(
    title="Wok'N'Cats POS System API",
    description="Point of Sale system for Wok'N'Cats Restaurant",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(menu_items.router, prefix="/api/v1/menu", tags=["Menu Items"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])
app.include_router(tables.router, prefix="/api/v1/tables", tags=["Tables"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(settings_router.router, prefix="/api/v1/settings", tags=["Settings"])
app.include_router(work_logs.router, prefix="/api/v1/work-logs", tags=["Work Logs"])
app.include_router(staff_profiles.router, prefix="/api/v1", tags=["Staff Profiles"])
app.include_router(coupons.router, prefix="/api/v1/coupons", tags=["Coupons"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["Recommendations"])
app.include_router(marketing.router, prefix="/api/v1/marketing", tags=["Marketing"])

@app.get("/")
async def root():
    return {
        "message": "Wok'N'Cats POS System API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# WebSocket endpoint for real-time order updates
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back or handle messages
            await manager.send_personal_message(f"Message received: {data}", client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id)
