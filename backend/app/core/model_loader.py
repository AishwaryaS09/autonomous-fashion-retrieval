"""
Model loader module - loads FashionCLIP/CLIP model once and provides inference.
"""
import torch
import logging
from typing import Optional
from transformers import CLIPModel, CLIPProcessor

logger = logging.getLogger(__name__)

_model_instance: Optional["ModelLoader"] = None


class ModelLoader:
    """Singleton model loader for FashionCLIP/CLIP."""

    def __init__(self, model_name: str = "patrickjohncyh/fashion-clip"):
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Loading model: {model_name} on device: {self.device}")
        self.processor = CLIPProcessor.from_pretrained(model_name)
        self.model = CLIPModel.from_pretrained(model_name)
        self.model.to(self.device)
        self.model.eval()
        self._embedding_dim = self.model.config.projection_dim
        logger.info(f"Model loaded. Embedding dimension: {self._embedding_dim}")

    @property
    def embedding_dim(self) -> int:
        return self._embedding_dim

    def encode_text(self, texts: list[str]) -> torch.Tensor:
        """Encode text queries into embeddings."""
        inputs = self.processor(text=texts, return_tensors="pt", padding=True, truncation=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        with torch.no_grad():
            embeddings = self.model.get_text_features(**inputs)
        embeddings = embeddings / embeddings.norm(dim=-1, keepdim=True)
        return embeddings.cpu().numpy()

    def encode_images(self, images: list) -> torch.Tensor:
        """Encode images into embeddings. images: list of PIL Images."""
        inputs = self.processor(images=images, return_tensors="pt", padding=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        with torch.no_grad():
            embeddings = self.model.get_image_features(**inputs)
        embeddings = embeddings / embeddings.norm(dim=-1, keepdim=True)
        return embeddings.cpu().numpy()

    def encode_image_single(self, image) -> torch.Tensor:
        """Encode a single PIL image into an embedding."""
        return self.encode_images([image])


def get_model_loader(model_name: str = "patrickjohncyh/fashion-clip") -> ModelLoader:
    """Get or create the singleton model loader."""
    global _model_instance
    if _model_instance is None:
        _model_instance = ModelLoader(model_name)
    return _model_instance
