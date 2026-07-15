"""
Check that the development environment is properly set up.
Run: python scripts/check_setup.py
"""
import sys
import os
import shutil
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def check(label, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"  [{status}] {label}")
    if detail and not condition:
        print(f"         -> {detail}")
    return condition


def main():
    print("=" * 50)
    print("Environment Setup Check")
    print("=" * 50 + "\n")

    all_pass = True

    print("Python:")
    all_pass &= check(
        f"Python version >= 3.10 (found {sys.version.split()[0]})",
        sys.version_info >= (3, 10),
    )

    print("\nNode:")
    node = shutil.which("node")
    if node:
        import subprocess
        v = subprocess.check_output([node, "--version"], text=True).strip()
        all_pass &= check(f"Node.js found ({v})", True)
    else:
        all_pass &= check("Node.js found", False, "Install from https://nodejs.org")

    print("\nDirectories:")
    for d in ["backend", "frontend", "data", "scripts", "vector_store", "models"]:
        path = ROOT / d
        all_pass &= check(f"{d}/ exists", path.exists())

    print("\nCatalog:")
    catalog = ROOT / "data" / "catalog"
    if catalog.exists():
        images = []
        for ext in ["*.jpg", "*.jpeg", "*.png", "*.webp"]:
            images.extend(catalog.rglob(ext))
        count = len(images)
        all_pass &= check(f"Catalog images found: {count}", count > 0, "Add images to data/catalog/")
    else:
        all_pass &= check("Catalog directory exists", False)

    print("\nPackages:")
    try:
        import fastapi
        check(f"FastAPI ({fastapi.__version__})", True)
    except ImportError:
        all_pass &= check("FastAPI installed", False, "Run: pip install -r backend/requirements.txt")

    try:
        import faiss
        check("FAISS available", True)
    except ImportError:
        all_pass &= check("FAISS installed", False, "Run: pip install faiss-cpu")

    try:
        import torch
        check(f"PyTorch ({torch.__version__})", True)
    except ImportError:
        all_pass &= check("PyTorch installed", False, "Run: pip install torch")

    try:
        import transformers
        check(f"Transformers ({transformers.__version__})", True)
    except ImportError:
        all_pass &= check("Transformers installed", False, "Run: pip install transformers")

    print("\nVector Store:")
    vs = ROOT / "vector_store"
    index_exists = (vs / "fashion.index").exists()
    check("FAISS index exists", index_exists, "Run: python scripts/build_index.py")

    print("\n" + "=" * 50)
    if all_pass:
        print("All checks passed!")
    else:
        print("Some checks failed. See details above.")
    print("=" * 50)


if __name__ == "__main__":
    main()
