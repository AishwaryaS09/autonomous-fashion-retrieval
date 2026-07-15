"""
Catalog and index management API routes.
"""
from fastapi import APIRouter, HTTPException
import numpy as np

from app.schemas.search import IndexStatusResponse
from app.core.catalog_service import CatalogService
from app.core.model_loader import get_model_loader
from app.core.embedding_service import EmbeddingService
from app.core.vector_search import VectorSearchEngine
from app.config import MODEL_NAME

router = APIRouter(prefix="/api", tags=["catalog", "index"])


@router.get("/catalog")
async def get_catalog():
    """Get all products in the catalog."""
    catalog = CatalogService()
    products = catalog.get_all_products()
    return {"products": products, "total": len(products)}


@router.post("/index/build")
async def build_index():
    """Build the FAISS index from catalog images."""
    try:
        catalog = CatalogService()
        products = catalog.scan_catalog()

        if not products:
            raise HTTPException(
                status_code=400,
                detail="No catalog images found. Please add images to data/catalog/ and try again.",
            )

        loader = get_model_loader(MODEL_NAME)
        embedder = EmbeddingService(loader)
        vector_engine = VectorSearchEngine()

        image_paths = [p["image_path"] for p in products]
        embeddings = embedder.encode_images_batch(image_paths)

        if embeddings.size == 0:
            raise HTTPException(
                status_code=400,
                detail="Failed to generate embeddings. Check that catalog images are valid.",
            )

        vector_engine.build_index(embeddings, products)

        return {
            "status": "success",
            "num_products": len(products),
            "embedding_dimension": int(embeddings.shape[1]),
            "message": f"Index built successfully with {len(products)} products.",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Index build failed: {str(e)}")


@router.get("/index/status", response_model=IndexStatusResponse)
async def get_index_status():
    """Get the current status of the FAISS index."""
    engine = VectorSearchEngine()
    status = engine.get_index_status()
    return IndexStatusResponse(**status)
