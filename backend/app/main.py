"""
Medicare Part D Drug Spending Explorer - FastAPI Backend

Main application entry point with API routes, CORS configuration, and middleware.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .api import drugs, years, categories
from .database import engine, Base

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Medicare Part D Drug Spending Explorer API",
    description="API for exploring Medicare Part D drug spending data by drug, year, and category",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(drugs.router, prefix="/api")
app.include_router(years.router, prefix="/api")
app.include_router(categories.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """
    Startup event handler.
    Creates database tables if they don't exist (for development).
    In production, use Alembic migrations instead.
    """
    # Note: In production, remove this and rely on Alembic migrations
    if os.getenv("APP_ENV") == "development":
        Base.metadata.create_all(bind=engine)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Medicare Part D Drug Spending Explorer API",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "api_base": "/api"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    # Get configuration from environment
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))

    # Run the application
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=os.getenv("APP_ENV") == "development"
    )
