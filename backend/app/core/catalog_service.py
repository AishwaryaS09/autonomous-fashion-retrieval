"""
Catalog service for scanning and managing fashion product catalogs.
"""
import json
import logging
from pathlib import Path
from typing import Optional

from app.config import CATALOG_DIR, SUPPORTED_IMAGE_FORMATS

logger = logging.getLogger(__name__)


class CatalogService:
    """Service for managing fashion product catalogs."""

    def __init__(self, catalog_dir: Optional[Path] = None):
        self.catalog_dir = catalog_dir or CATALOG_DIR

    def scan_catalog(self) -> list[dict]:
        """Scan the catalog directory and return all products with metadata."""
        metadata = self._load_metadata()
        metadata_map = {m["id"]: m for m in metadata if "id" in m}

        products = []
        if not self.catalog_dir.exists():
            logger.warning(f"Catalog directory does not exist: {self.catalog_dir}")
            return products

        for category_dir in sorted(self.catalog_dir.iterdir()):
            if not category_dir.is_dir():
                continue

            category = category_dir.name

            for img_file in sorted(category_dir.iterdir()):
                if img_file.suffix.lower() not in SUPPORTED_IMAGE_FORMATS:
                    continue

                product_id = img_file.stem
                meta = metadata_map.get(product_id, {})

                product = {
                    "id": meta.get("id", product_id),
                    "name": meta.get("name", f"{category.title()} {product_id}"),
                    "category": meta.get("category", category),
                    "color": meta.get("color", ""),
                    "pattern": meta.get("pattern", ""),
                    "image_path": str(img_file),
                    "image_filename": img_file.name,
                    "category_dir": category,
                }
                products.append(product)

        logger.info(f"Scanned catalog: {len(products)} products found")
        return products

    def get_all_products(self) -> list[dict]:
        """Get all products with sanitized paths for API response."""
        products = self.scan_catalog()
        for p in products:
            p["image_url"] = f"/catalog/{p['category_dir']}/{p['image_filename']}"
            p.pop("image_path", None)
            p.pop("image_filename", None)
            p.pop("category_dir", None)
        return products

    def get_product_by_id(self, product_id: str) -> Optional[dict]:
        """Get a specific product by its ID."""
        products = self.scan_catalog()
        for p in products:
            if p["id"] == product_id:
                p["image_url"] = f"/catalog/{p['category_dir']}/{p['image_filename']}"
                return p
        return None

    def _load_metadata(self) -> list[dict]:
        """Load metadata from products.json if it exists."""
        metadata_path = self.catalog_dir.parent / "metadata" / "products.json"
        if not metadata_path.exists():
            logger.info("No metadata file found, using directory structure only.")
            return []

        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load metadata: {e}")
            return []
