"""
Image search API routes.
"""
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from app.schemas.search import SearchResponse, SearchProduct
from app.core.model_loader import get_model_loader
from app.core.embedding_service import EmbeddingService
from app.core.preprocessing import ImagePreprocessor
from app.core.vector_search import VectorSearchEngine
from app.core.reranking import ReRankingEngine
from app.config import MODEL_NAME, SUPPORTED_IMAGE_FORMATS

router = APIRouter(prefix="/api/search", tags=["search"])


@router.post("/image", response_model=SearchResponse)
async def search_by_image(
    image: UploadFile = File(...),
    top_k: int = Form(default=10),
    category: str = Form(default=None),
):
    """Search fashion catalog using an uploaded image."""
    try:
        ext = Path(image.filename).suffix.lower()
        if ext not in SUPPORTED_IMAGE_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported image format: {ext}. Supported: {', '.join(SUPPORTED_IMAGE_FORMATS)}",
            )

        contents = await image.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty image file.")

        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        try:
            preprocessor = ImagePreprocessor()
            pil_image = preprocessor.preprocess(tmp_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")
        finally:
            Path(tmp_path).unlink(missing_ok=True)

        try:
            loader = get_model_loader(MODEL_NAME)
            embedder = EmbeddingService(loader)
            vector_engine = VectorSearchEngine()

            if not vector_engine.load_index():
                raise HTTPException(
                    status_code=400,
                    detail="Index not built. Please build the FAISS index first.",
                )

            query_embedding = embedder.encode_image(pil_image)
        finally:
            pil_image.close()

        results = vector_engine.search(query_embedding, top_k=top_k)

        reranker = ReRankingEngine()
        results = reranker.rerank(results, query_category=category)

        if category:
            results = [r for r in results if r.get("category", "").lower() == category.lower()]

        search_results = [
            SearchProduct(
                id=r["id"],
                name=r.get("name", ""),
                category=r.get("category", ""),
                image_url=f"/catalog/{r.get('category_dir', r.get('category', ''))}/{r.get('image_filename', r.get('id', '') + '.jpg')}",
                similarity_score=round(r.get("similarity_score", 0), 4),
                reranking_score=round(r.get("reranking_score", 0), 4),
                color=r.get("color", ""),
                pattern=r.get("pattern", ""),
            )
            for r in results
        ]

        return SearchResponse(query_type="image", results=search_results)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image search failed: {str(e)}")
