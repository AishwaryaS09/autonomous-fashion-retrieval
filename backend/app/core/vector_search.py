"""
Vector search engine using FAISS.
"""
import json
import logging
import numpy as np
from pathlib import Path
from typing import Optional

import faiss

from app.config import (
    FAISS_INDEX_PATH,
    PRODUCT_IDS_PATH,
    PRODUCT_METADATA_PATH,
    INDEX_INFO_PATH,
)

logger = logging.getLogger(__name__)


class VectorSearchEngine:
    """FAISS-based vector search engine for fashion retrieval."""

    def __init__(self):
        self.index: Optional[faiss.Index] = None
        self.product_ids: list[str] = []
        self.product_metadata: list[dict] = []
        self.is_loaded = False

    def build_index(self, embeddings: np.ndarray, products: list[dict]) -> None:
        """Build FAISS index from embeddings and product metadata."""
        if embeddings.size == 0:
            raise ValueError("No embeddings provided to build index")

        dim = embeddings.shape[1]
        n_products = embeddings.shape[0]

        self.index = faiss.IndexFlatIP(dim)
        faiss.normalize_L2(embeddings)
        self.index.add(embeddings)

        self.product_ids = [p["id"] for p in products]
        self.product_metadata = products

        self._save_index(dim, n_products)
        self.is_loaded = True
        logger.info(f"Index built: {n_products} products, dimension {dim}")

    def search(self, query_embedding: np.ndarray, top_k: int = 10) -> list[dict]:
        """Search the index with a query embedding."""
        if not self.is_loaded or self.index is None:
            raise RuntimeError("Index not built. Please build the index first.")

        query = query_embedding.reshape(1, -1).astype(np.float32)
        faiss.normalize_L2(query)

        actual_k = min(top_k, self.index.ntotal)
        scores, indices = self.index.search(query, actual_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.product_metadata):
                continue
            product = self.product_metadata[idx].copy()
            product["similarity_score"] = float(score)
            results.append(product)

        return results

    def load_index(self) -> bool:
        """Load a persisted FAISS index from disk."""
        if not FAISS_INDEX_PATH.exists():
            logger.warning("No saved index found.")
            return False

        try:
            self.index = faiss.read_index(str(FAISS_INDEX_PATH))

            with open(PRODUCT_IDS_PATH, "r") as f:
                self.product_ids = json.load(f)

            with open(PRODUCT_METADATA_PATH, "r") as f:
                self.product_metadata = json.load(f)

            self.is_loaded = True
            logger.info(f"Index loaded: {self.index.ntotal} products")
            return True
        except Exception as e:
            logger.error(f"Failed to load index: {e}")
            return False

    def _save_index(self, dim: int, n_products: int) -> None:
        """Persist index and metadata to disk."""
        VECTOR_STORE_DIR = FAISS_INDEX_PATH.parent
        VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)

        faiss.write_index(self.index, str(FAISS_INDEX_PATH))

        with open(PRODUCT_IDS_PATH, "w") as f:
            json.dump(self.product_ids, f, indent=2)

        with open(PRODUCT_METADATA_PATH, "w") as f:
            json.dump(self.product_metadata, f, indent=2)

        info = {
            "embedding_dimension": dim,
            "num_products": n_products,
            "model_name": "fashion-clip",
            "index_type": "IndexFlatIP",
            "status": "ready",
        }
        with open(INDEX_INFO_PATH, "w") as f:
            json.dump(info, f, indent=2)

    def get_index_status(self) -> dict:
        """Get current index status information."""
        if not INDEX_INFO_PATH.exists():
            return {
                "status": "not_built",
                "num_products": 0,
                "embedding_dimension": 0,
                "model_name": "unknown",
            }

        with open(INDEX_INFO_PATH, "r") as f:
            info = json.load(f)
        return info
