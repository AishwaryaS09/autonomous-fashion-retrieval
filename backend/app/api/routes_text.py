"""
Text search API routes.
"""
from fastapi import APIRouter, HTTPException, Request

from app.schemas.search import TextSearchRequest, SearchResponse, SearchProduct
from app.core.model_loader import get_model_loader
from app.core.embedding_service import EmbeddingService
from app.core.vector_search import VectorSearchEngine
from app.core.reranking import ReRankingEngine, compute_candidate_count
from app.config import MODEL_NAME

router = APIRouter(prefix="/api/search", tags=["search"])


@router.post("/text", response_model=SearchResponse)
async def search_by_text(request: TextSearchRequest):
    """Search fashion catalog using a text description."""
    try:
        loader = get_model_loader(MODEL_NAME)
        embedder = EmbeddingService(loader)
        vector_engine = VectorSearchEngine()

        if not vector_engine.load_index():
            raise HTTPException(
                status_code=400,
                detail="Index not built. Please build the FAISS index first using POST /api/index/build.",
            )

        catalog_size = vector_engine.index.ntotal
        candidate_k = compute_candidate_count(request.top_k, catalog_size)

        query_embedding = embedder.encode_text(request.query)
        candidates = vector_engine.search(query_embedding, top_k=candidate_k)

        reranker = ReRankingEngine()
        results = reranker.rerank(
            candidates,
            query_text=request.query,
            query_category=request.category,
            top_k=request.top_k,
        )

        search_results = [
            SearchProduct(
                id=r["id"],
                name=r.get("name", ""),
                category=r.get("category", ""),
                image_url=f"/catalog/{r.get('category_dir', r.get('category', ''))}/{r.get('image_filename', r.get('id', '') + '.jpg')}",
                similarity_score=round(r.get("similarity_score", 0), 4),
                reranking_score=round(r.get("reranking_score", 0), 4),
                primary_color=r.get("primary_color", ""),
                secondary_color=r.get("secondary_color", ""),
                color=r.get("color", ""),
                pattern=r.get("pattern", ""),
                style=r.get("style", ""),
                material=r.get("material", ""),
                fit=r.get("fit", ""),
                length=r.get("length", ""),
                sleeve_type=r.get("sleeve_type", ""),
                neckline=r.get("neckline", ""),
                footwear_type=r.get("footwear_type", ""),
                heel_type=r.get("heel_type", ""),
                bag_type=r.get("bag_type", ""),
                occasion=r.get("occasion", ""),
                season=r.get("season", ""),
                gender=r.get("gender", ""),
                description=r.get("description", ""),
            )
            for r in results
        ]

        return SearchResponse(query_type="text", results=search_results)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
