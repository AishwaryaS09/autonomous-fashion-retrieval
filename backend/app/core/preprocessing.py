"""
Image and sketch preprocessing module.
"""
import cv2
import numpy as np
import logging
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter

logger = logging.getLogger(__name__)


class ImagePreprocessor:
    """Preprocesses images for CLIP model input."""

    def preprocess(self, image_path: str) -> Image.Image:
        """Load and preprocess an image file for model input.

        Reads file bytes into memory before opening with PIL so that no
        file handle is retained. This allows the caller to safely delete
        the source file (e.g. a temporary upload) on all platforms
        including Windows.
        """
        path = Path(image_path)
        if not path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        ext = path.suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
            raise ValueError(f"Unsupported image format: {ext}")

        try:
            raw_bytes = path.read_bytes()
        except Exception as e:
            raise ValueError(f"Cannot read image file: {image_path}: {e}")

        try:
            img = Image.open(BytesIO(raw_bytes))
        except Exception as e:
            raise ValueError(f"Corrupt or unreadable image: {image_path}: {e}")

        try:
            if img.mode == "RGBA":
                background = Image.new("RGB", img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background
            elif img.mode != "RGB":
                img = img.convert("RGB")

            img = self._fix_orientation(img)
            return img
        except Exception:
            img.close()
            raise

    def _fix_orientation(self, img: Image.Image) -> Image.Image:
        """Fix image orientation using EXIF data if available."""
        try:
            from PIL import ExifTags
            exif = img.getexif()
            orientation_key = None
            for key, val in ExifTags.TAGS.items():
                if val == "Orientation":
                    orientation_key = key
                    break
            if orientation_key and orientation_key in exif:
                orientation = exif[orientation_key]
                if orientation == 3:
                    img = img.rotate(180, expand=True)
                elif orientation == 6:
                    img = img.rotate(270, expand=True)
                elif orientation == 8:
                    img = img.rotate(90, expand=True)
        except Exception:
            pass
        return img


class SketchPreprocessor:
    """Preprocesses hand-drawn sketches for model input."""

    def preprocess(self, image_path: str) -> Image.Image:
        """Load and preprocess a sketch image for model input.

        Reads file bytes into memory before opening with PIL so that no
        file handle is retained. This allows the caller to safely delete
        the source file (e.g. a temporary upload) on all platforms
        including Windows.
        """
        path = Path(image_path)
        if not path.exists():
            raise FileNotFoundError(f"Sketch not found: {image_path}")

        try:
            raw_bytes = path.read_bytes()
        except Exception as e:
            raise ValueError(f"Cannot read sketch file: {image_path}: {e}")

        try:
            img = Image.open(BytesIO(raw_bytes))
        except Exception as e:
            raise ValueError(f"Corrupt or unreadable sketch: {image_path}: {e}")

        try:
            img_np = np.array(img)
        finally:
            img.close()

        if len(img_np.shape) == 3:
            gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_np

        gray = self._remove_background_noise(gray)
        gray = self._enhance_contrast(gray)
        gray = self._normalize_lines(gray)
        gray = self._remove_light_background(gray)

        result = Image.fromarray(gray).convert("RGB")
        return result

    def preprocess_pil(self, img: Image.Image) -> Image.Image:
        """Preprocess a PIL Image as a sketch."""
        img_np = np.array(img)

        if len(img_np.shape) == 3:
            gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_np

        gray = self._remove_background_noise(gray)
        gray = self._enhance_contrast(gray)
        gray = self._normalize_lines(gray)
        gray = self._remove_light_background(gray)

        return Image.fromarray(gray).convert("RGB")

    def _remove_background_noise(self, gray: np.ndarray) -> np.ndarray:
        """Remove light background noise from sketch."""
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return binary

    def _enhance_contrast(self, gray: np.ndarray) -> np.ndarray:
        """Enhance contrast of the sketch."""
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        return enhanced

    def _normalize_lines(self, gray: np.ndarray) -> np.ndarray:
        """Normalize line thickness in the sketch."""
        kernel = np.ones((2, 2), np.uint8)
        dilated = cv2.dilate(gray, kernel, iterations=1)
        return dilated

    def _remove_light_background(self, gray: np.ndarray) -> np.ndarray:
        """Ensure background is white and lines are dark."""
        _, binary = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)
        inverted = cv2.bitwise_not(binary)
        _, final = cv2.threshold(inverted, 30, 255, cv2.THRESH_BINARY)
        result = cv2.bitwise_not(final)
        return result
