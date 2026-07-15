"""
Build the FAISS index from catalog images.
Run from the backend directory: python -m scripts.build_index
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import MODEL_NAME, CATALOG_DIR
from app.core.model_loader import get_model_loader
from app.core.embedding_service import EmbeddingService
from app.core.catalog_service import CatalogService
from app.core.vector_search import VectorSearchEngine


def main():
    print("=" * 60)
    print("Building FAISS Index for Fashion Retrieval")
    print("=" * 60)

    print("\n1. Scanning catalog...")
    catalog = CatalogService()
    products = catalog.scan_catalog()
    print(f"   Found {len(products)} products in {CATALOG_DIR}")

    if not products:
        print("\nERROR: No catalog images found.")
        print(f"   Add images to: {CATALOG_DIR}")
        print("   Supported formats: .jpg, .jpeg, .png, .webp")
        return

    print("\n2. Loading model...")
    loader = get_model_loader(MODEL_NAME)
    embedder = EmbeddingService(loader)
    print(f"   Model: {MODEL_NAME}")
    print(f"   Embedding dimension: {embedder.embedding_dim}")

    print("\n3. Generating embeddings...")
    image_paths = [p["image_path"] for p in products]
    embeddings = embedder.encode_images_batch(image_paths)
    print(f"   Generated {embeddings.shape[0]} embeddings of dimension {embeddings.shape[1]}")

    print("\n4. Building FAISS index...")
    engine = VectorSearchEngine()
    engine.build_index(embeddings, products)

    print("\n" + "=" * 60)
    print("Index built successfully!")
    print(f"   Products indexed: {len(products)}")
    print(f"   Embedding dimension: {embedder.embedding_dim}")
    print(f"   Index saved to: vector_store/")
    print("=" * 60)


if __name__ == "__main__":
    main()
