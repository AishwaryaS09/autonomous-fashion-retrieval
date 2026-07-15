# Implementation Guide

## Phase 1: Project Structure
- Created modular directory layout
- Configured backend (FastAPI) and frontend (React/Vite)
- Set up environment variables and configuration

## Phase 2: Model Loading and Embeddings
- `model_loader.py`: Singleton pattern for FashionCLIP loading
- `embedding_service.py`: High-level API for text and image embeddings
- Model loads once on first use, cached for subsequent requests

## Phase 3: Catalog and FAISS Indexing
- `catalog_service.py`: Scans catalog directory recursively
- `vector_search.py`: Builds and queries FAISS IndexFlatIP
- Index persists to disk; auto-loads on startup if available

## Phase 4: Text Search
- `routes_text.py`: POST /api/search/text endpoint
- Validates query, generates text embedding, searches index

## Phase 5: Image Search
- `routes_image.py`: POST /api/search/image endpoint
- Handles multipart upload, validates format, generates image embedding

## Phase 6: Sketch Search
- `routes_sketch.py`: POST /api/search/sketch endpoint
- `preprocessing.py`: SketchPreprocessor with grayscale, contrast, noise removal
- Treated as image search after preprocessing

## Phase 7: Re-ranking
- `reranking.py`: Combines embedding similarity with metadata
- Weighted formula: 70% embedding + 15% category + 10% attributes + 5% keywords
- Returns both raw and re-ranked scores

## Phase 8: Frontend
- React components: SearchTabs, TextSearch, ImageSearch, SketchCanvas
- Canvas-based sketch drawing with undo, brush control, clear
- ResultsGrid with responsive product cards
- Error handling for backend unavailability

## Phase 9: Integration
- Frontend connects to backend via Axios
- CORS configured for development ports
- Static file serving for catalog images

## Phase 10: Testing and Documentation
- Backend pytest tests for API endpoints
- Setup verification script
- API test script
- Complete documentation
