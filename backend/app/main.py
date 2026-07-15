"""
FastAPI main application for Cross-Modal Fashion Retrieval.
"""
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import FRONTEND_URL, CATALOG_DIR
from app.api.routes_text import router as text_router
from app.api.routes_image import router as image_router
from app.api.routes_sketch import router as sketch_router
from app.api.routes_catalog import router as catalog_router
from app.schemas.search import HealthResponse

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Starting Cross-Modal Fashion Retrieval API...")
    if CATALOG_DIR.exists():
        logger.info(f"Catalog directory: {CATALOG_DIR}")
    else:
        logger.warning(f"Catalog directory not found: {CATALOG_DIR}")
    yield
    logger.info("Shutting down API...")


app = FastAPI(
    title="Cross-Modal Fashion Retrieval API",
    description="Search fashion using text, images, or sketches via Vision-Language models",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(text_router)
app.include_router(image_router)
app.include_router(sketch_router)
app.include_router(catalog_router)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok")


# Serve catalog images statically
catalog_static_dir = CATALOG_DIR.parent / "catalog"
if catalog_static_dir.exists():
    app.mount("/catalog", StaticFiles(directory=str(catalog_static_dir)), name="catalog")
    logger.info(f"Mounted catalog static files from {catalog_static_dir}")
