"""
Embedding service - wraps model loader to provide high-level embedding API.
"""
import numpy as np
import logging
from typing import Union
from PIL import Image

from app.core.model_loader import ModelLoader

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating embeddings from text and images."""

    def __init__(self, model_loader: ModelLoader):
        self.model_loader = model_loader

    @property
    def embedding_dim(self) -> int:
        return self.model_loader.embedding_dim

    def encode_text(self, text: str) -> np.ndarray:
        """Encode a single text query into a normalized embedding vector."""
        embeddings = self.model_loader.encode_text([text])
        return embeddings[0]

    def encode_text_batch(self, texts: list[str]) -> np.ndarray:
        """Encode a batch of texts into normalized embedding vectors."""
        if not texts:
            return np.array([])
        return np.array(self.model_loader.encode_text(texts))

    def encode_image(self, image: Image.Image) -> np.ndarray:
        """Encode a single PIL image into a normalized embedding vector."""
        embeddings = self.model_loader.encode_images([image])
        return embeddings[0]

    def encode_images_batch(self, image_paths: list[str], batch_size: int = 32) -> np.ndarray:
        """Encode a batch of images from file paths into normalized embeddings.

        PIL images are closed after each batch to release memory and file
        handles promptly.
        """
        from app.core.preprocessing import ImagePreprocessor

        preprocessor = ImagePreprocessor()
        all_embeddings = []

        for i in range(0, len(image_paths), batch_size):
            batch_paths = image_paths[i:i + batch_size]
            images = []
            valid_paths = []
            for path in batch_paths:
                try:
                    img = preprocessor.preprocess(path)
                    images.append(img)
                    valid_paths.append(path)
                except Exception as e:
                    logger.warning(f"Failed to load image {path}: {e}")
                    continue

            if images:
                try:
                    embeddings = self.model_loader.encode_images(images)
                    all_embeddings.append(embeddings)
                    logger.info(f"Encoded batch {i // batch_size + 1}: {len(images)} images")
                finally:
                    for img in images:
                        img.close()

        if not all_embeddings:
            return np.array([])

        return np.vstack(all_embeddings)
