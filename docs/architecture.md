# Architecture

## System Overview

The Cross-Modal Fashion Retrieval system converts three types of user queries (text, images, sketches) into a shared embedding space using a Vision-Language Foundation Model, then performs vector similarity search to retrieve matching fashion products.

## Core Components

### 1. Input Layer
- **Text Input**: Natural language description of desired fashion item
- **Image Input**: Uploaded photograph of a fashion item
- **Sketch Input**: Hand-drawn sketch on an HTML Canvas

### 2. Preprocessing Layer
- **Text**: Trimming, validation, tokenization
- **Image**: Format validation, RGB conversion, orientation fix, resize
- **Sketch**: Grayscale conversion, contrast enhancement, noise removal, line normalization

### 3. Multimodal Encoder
- Model: FashionCLIP (patrickjohncyh/fashion-clip)
- Architecture: CLIP ViT-B/32 fine-tuned on fashion data
- Produces 512-dimensional L2-normalized embeddings
- Same encoder handles both text and images

### 4. Vector Search Engine
- FAISS IndexFlatIP for inner product similarity
- Supports incremental index building
- Persisted to disk as index files

### 5. Re-ranking Engine
- Combines multiple signals for final ranking:
  - 70% embedding similarity
  - 15% category match
  - 10% attribute match (color, pattern)
  - 5% keyword overlap

### 6. Results Layer
- Returns ranked product cards with images
- Shows both raw similarity and re-ranking scores

## Data Flow

```
User Query
    |
Preprocessing (validate, clean, resize)
    |
FashionCLIP Encoder (text or image features)
    |
L2 Normalized Embedding Vector
    |
FAISS Search (top-k nearest neighbors)
    |
Re-ranking (score adjustment)
    |
Ranked Results (products with scores)
```

## Component Diagram

```
+-------------------+     +-------------------+     +-------------------+
|   Frontend        |     |   Backend         |     |   Storage         |
|   React/Vite      |<--->|   FastAPI         |<--->|   FAISS Index     |
|   TypeScript      |     |   Python          |     |   Product Meta    |
+-------------------+     +-------------------+     +-------------------+
        |                         |                         |
    Search UI              API Endpoints              Vector Store
    Results Grid           Model Loader               Catalog Images
    Sketch Canvas          Embedding Service           Metadata JSON
```

## Model Details

### FashionCLIP
- Base: OpenAI CLIP ViT-B/32
- Fine-tuned on fashion e-commerce data
- Shared embedding space for text and images
- 512-dimensional output vectors
- L2-normalized for cosine similarity

### Why FashionCLIP over Generic CLIP?
- Better understanding of fashion terminology
- Improved retrieval accuracy for fashion-specific queries
- Handles fashion attributes (color, pattern, style) better

## Index Architecture

```
vector_store/
├── fashion.index        # FAISS index file (binary)
├── product_ids.json     # Ordered list of product IDs
├── product_metadata.json # Full product metadata
└── index_info.json      # Index statistics and configuration
```

The FAISS index uses IndexFlatIP (flat inner product) for exact search. This is suitable for catalogs up to ~100K items. For larger catalogs, IVF or HNSW indexes could be used.
