"""
File utility functions.
"""
import os
from pathlib import Path
from typing import Optional


def ensure_directory(path: Path) -> None:
    """Ensure a directory exists, creating it if necessary."""
    path.mkdir(parents=True, exist_ok=True)


def get_file_extension(filename: str) -> str:
    """Get lowercase file extension including the dot."""
    return Path(filename).suffix.lower()


def is_supported_image(filename: str) -> bool:
    """Check if a file has a supported image extension."""
    supported = {".jpg", ".jpeg", ".png", ".webp"}
    return get_file_extension(filename) in supported


def safe_filename(filename: str) -> str:
    """Sanitize a filename to prevent path traversal."""
    return Path(filename).name


def get_file_size_mb(filepath: str) -> float:
    """Get file size in megabytes."""
    size_bytes = os.path.getsize(filepath)
    return size_bytes / (1024 * 1024)
