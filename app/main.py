from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from dotenv import load_dotenv

from app.db.database import init_db, close_db
from app.routers import expenses, settlements, people

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Expense Splitter API",
    description="API for splitting expenses among friends",
    version="1.0.0",
)

# Get frontend URL from environment or use deployed frontend URL
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://expense-splitter-frontend.onrender.com")

# Configure CORS - more restrictive for production
allowed_origins = [
    FRONTEND_URL,                                     # Your frontend URL from env var
    "http://localhost:5173",                          # Local development frontend
    "http://localhost:3000",                          # Alternative local frontend port
    "https://expense-splitter-frontend.onrender.com"  # Directly add your deployed frontend URL
]

# If we're not in production, allow all origins for easier development
if os.getenv("ENVIRONMENT") != "production":
    allowed_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
app.include_router(settlements.router, tags=["Settlements"])
app.include_router(people.router, prefix="/people", tags=["People"])

@app.on_event("startup")
async def startup_db_client():
    logger.info("Starting up and connecting to MongoDB...")
    await init_db()
    logger.info("Connected to MongoDB!")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down and closing MongoDB connection...")
    await close_db()
    logger.info("MongoDB connection closed!")

@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    mongodb_uri = os.getenv("MONGODB_URI", "Not set")
    safe_uri = mongodb_uri.replace("://", "://***:***@") if "://" in mongodb_uri else "Not set"
    
    return {
        "status": "ok", 
        "message": "Expense Splitter API is running",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "database": {
            "connection": "Configured" if os.getenv("MONGODB_URI") else "Not configured",
            "uri_sample": safe_uri.split("@")[-1] if "@" in safe_uri else "local"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)