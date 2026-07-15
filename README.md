# Autonomous Cross-Modal Fashion Retrieval

A complete fashion retrieval platform that searches a fashion catalog using text descriptions, uploaded images, or hand-drawn sketches. Powered by FashionCLIP (Vision-Language Foundation Model) and FAISS vector search.

## Features

- **Text-to-Image Search**: Describe what you want in natural language
- **Image-to-Image Search**: Upload a fashion photo to find similar items
- **Sketch-to-Image Search**: Draw a sketch to find matching products
- **Re-ranking Engine**: Combines embedding similarity with attribute matching
- **Persistent FAISS Index**: Build once, search many times
- **Responsive UI**: Clean React frontend with three search tabs

## Architecture

```
Text / Image / Sketch
        |
   Preprocessing
        |
 FashionCLIP / CLIP
        |
  Shared Embedding Space
        |
  FAISS Vector Search
        |
   Re-ranking
        |
  Ranked Results
```

## Folder Structure

```
COE/
├── backend/          # FastAPI Python backend
├── frontend/         # React + Vite + TypeScript frontend
├── data/             # Fashion catalog images and metadata
├── scripts/          # Setup, build, and test scripts
├── models/           # Downloaded model files (auto-populated)
├── vector_store/     # FAISS index and metadata (auto-generated)
├── sample_queries/   # Example search queries
├── docs/             # Detailed documentation
├── .gitignore
├── README.md
└── docker-compose.yml
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- Git
- ~2GB disk space for model files
- CUDA-capable GPU recommended (works on CPU too)

## Dataset Setup

1. Create category folders under `data/catalog/` (already exists)
2. Add fashion images (.jpg, .png, .webp) to the appropriate folders
3. Optionally populate `data/metadata/products.json`
4. See `data/README.md` for detailed instructions

## Backend Installation

```bash
# Windows
.\scripts\setup_backend.ps1

# Linux/macOS
bash scripts/setup_backend.sh
```

Or manually:

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

## Frontend Installation

```bash
# Windows
.\scripts\setup_frontend.ps1

# Linux/macOS
bash scripts/setup_frontend.sh
```

Or manually:

```bash
cd frontend
npm install
```

## Model Setup

The FashionCLIP model downloads automatically on first use from Hugging Face. Ensure internet connectivity during first run.

Model: `patrickjohncyh/fashion-clip` (CLIP ViT-B/32 fine-tuned on fashion data)

## Building the FAISS Index

After adding catalog images:

```bash
cd backend
python -c "
from app.core.catalog_service import CatalogService
from app.core.vector_search import VectorSearchEngine
from app.core.model_loader import get_model_loader
from app.core.embedding_service import EmbeddingService

loader = get_model_loader()
embedder = EmbeddingService(loader)
catalog = CatalogService()
engine = VectorSearchEngine()

products = catalog.scan_catalog()
embeddings = embedder.encode_images_batch([p['image_path'] for p in products])
engine.build_index(embeddings, products)
print('Index built successfully')
"
```

Or use the script:

```bash
cd backend
python -m scripts.build_index
```

Or call the API:

```bash
curl -X POST http://localhost:8000/api/index/build
```

## Running the Project

**Terminal 1 - Backend:**

```bash
cd backend
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/macOS
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/catalog` | List all products |
| POST | `/api/index/build` | Build FAISS index |
| GET | `/api/index/status` | Get index status |
| POST | `/api/search/text` | Text search |
| POST | `/api/search/image` | Image search |
| POST | `/api/search/sketch` | Sketch search |

## Example Text Queries

- "red floral summer dress"
- "blue denim jacket"
- "black leather boots"
- "white cotton shirt with stripes"
- "casual beige pants"

## Docker Execution

```bash
docker-compose up --build
```

Backend: http://localhost:8000
Frontend: http://localhost:5173

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Model download fails | Check internet connection; try again |
| No catalog images | Add images to `data/catalog/` subdirectories |
| Index not built | Call `POST /api/index/build` or use the UI button |
| Backend won't start | Ensure all deps installed; check Python 3.10+ |
| Frontend can't connect | Verify backend is running on port 8000 |
| Out of memory | Reduce batch size in embedding service |

## Common Errors

- **"No catalog images found"**: Add images to `data/catalog/` in supported formats
- **"Index not built"**: Build the index via API or UI before searching
- **"Unsupported image type"**: Use .jpg, .jpeg, .png, or .webp files
- **"Model cannot be downloaded"**: Check internet and Hugging Face access

## Limitations

- FashionCLIP has limited vocabulary for very niche fashion terms
- Sketch search accuracy depends on sketch quality
- No real-time training or fine-tuning (uses pretrained embeddings)
- Maximum search results limited to catalog size
- Large catalogs may require significant memory for indexing

## Future Improvements

- Add user feedback loop for improving results
- Implement model fine-tuning on custom fashion data
- Add multi-language text search support
- Implement progressive loading for large catalogs
- Add more sophisticated sketch preprocessing
- Support video-based fashion search
