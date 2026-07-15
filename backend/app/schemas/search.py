"""
Pydantic schemas for search API requests and responses.
"""
from typing import Optional
from pydantic import BaseModel, Field


class TextSearchRequest(BaseModel):
    """Request schema for text-based search."""
    query: str = Field(..., min_length=1, max_length=500, description="Text search query")
    top_k: int = Field(default=10, ge=1, le=100, description="Number of results to return")
    category: Optional[str] = Field(default=None, description="Filter by category")


class ImageSearchRequest(BaseModel):
    """Request schema for image-based search (query params)."""
    top_k: int = Field(default=10, ge=1, le=100)
    category: Optional[str] = None


class SearchProduct(BaseModel):
    """A single search result."""
    id: str
    name: str
    category: str
    image_url: str
    similarity_score: float
    reranking_score: float
    color: Optional[str] = ""
    pattern: Optional[str] = ""


class SearchResponse(BaseModel):
    """Unified search response format."""
    query_type: str
    results: list[SearchProduct]


class IndexStatusResponse(BaseModel):
    """Index status response."""
    status: str
    num_products: int
    embedding_dimension: int
    model_name: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
