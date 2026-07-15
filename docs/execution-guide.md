# Execution Guide

## Quick Start

### 1. Prerequisites Check

```bash
python scripts/check_setup.py
```

### 2. Setup Backend

```bash
# Windows
.\scripts\setup_backend.ps1

# Linux/macOS
bash scripts/setup_backend.sh
```

### 3. Setup Frontend

```bash
# Windows
.\scripts\setup_frontend.ps1

# Linux/macOS
bash scripts/setup_frontend.sh
```

### 4. Add Catalog Images

Place fashion images in `data/catalog/` subdirectories:
- `data/catalog/dresses/`
- `data/catalog/shirts/`
- `data/catalog/jackets/`
- `data/catalog/pants/`
- `data/catalog/shoes/`
- `data/catalog/bags/`

Supported formats: .jpg, .jpeg, .png, .webp

### 5. Build the Index

```bash
cd backend
python -m scripts.build_index
```

Or via API:
```bash
curl -X POST http://localhost:8000/api/index/build
```

### 6. Start Backend

```bash
cd backend
venv\Scripts\activate   # Windows
uvicorn app.main:app --reload --port 8000
```

### 7. Start Frontend

```bash
cd frontend
npm run dev
```

### 8. Open Browser

Navigate to http://localhost:5173

## Testing

### Run All Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

### Run API Test Script

```bash
cd backend
python -m scripts.test_api
```

## Docker

### Build and Run

```bash
docker-compose up --build
```

### Stop

```bash
docker-compose down
```

## Example Usage

### Text Search
Type "red floral summer dress" in the text search box and click Search.

### Image Search
Upload a photo of a fashion item using the image upload area and click Search by Image.

### Sketch Search
Draw a sketch of the fashion item on the canvas and click Search by Sketch.
