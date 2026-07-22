import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_NAME = os.getenv("MODEL_NAME", "patrickjohncyh/fashion-clip")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
CATALOG_DIR = Path(os.getenv("CATALOG_DIR", str(BASE_DIR.parent / "data" / "catalog")))
VECTOR_STORE_DIR = Path(os.getenv("VECTOR_STORE_DIR", str(BASE_DIR.parent / "vector_store")))
TOP_K_DEFAULT = int(os.getenv("TOP_K_DEFAULT", "10"))
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

SUPPORTED_IMAGE_FORMATS = {".jpg", ".jpeg", ".png", ".webp"}

FAISS_INDEX_PATH = VECTOR_STORE_DIR / "fashion.index"
PRODUCT_IDS_PATH = VECTOR_STORE_DIR / "product_ids.json"
PRODUCT_METADATA_PATH = VECTOR_STORE_DIR / "product_metadata.json"
INDEX_INFO_PATH = VECTOR_STORE_DIR / "index_info.json"
