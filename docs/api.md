# API Reference

Base URL: `http://localhost:8000`

## Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

## Catalog

### List Products

```
GET /api/catalog
```

**Response:**
```json
{
  "products": [
    {
      "id": "dress_001",
      "name": "Red Floral Dress",
      "category": "dresses",
      "color": "red",
      "pattern": "floral",
      "image_url": "/catalog/dresses/dress_001.jpg"
    }
  ],
  "total": 12
}
```

---

## Index Management

### Build Index

```
POST /api/index/build
```

**Response:**
```json
{
  "status": "success",
  "num_products": 12,
  "embedding_dimension": 512,
  "message": "Index built successfully with 12 products."
}
```

### Index Status

```
GET /api/index/status
```

**Response:**
```json
{
  "status": "ready",
  "num_products": 12,
  "embedding_dimension": 512,
  "model_name": "fashion-clip"
}
```

---

## Search

### Text Search

```
POST /api/search/text
```

**Request Body:**
```json
{
  "query": "red floral summer dress",
  "top_k": 10,
  "category": "dresses"
}
```

**Response:**
```json
{
  "query_type": "text",
  "results": [
    {
      "id": "dress_001",
      "name": "Red Floral Dress",
      "category": "dresses",
      "image_url": "/catalog/dresses/dress_001.jpg",
      "similarity_score": 0.91,
      "reranking_score": 0.94,
      "color": "red",
      "pattern": "floral"
    }
  ]
}
```

### Image Search

```
POST /api/search/image
Content-Type: multipart/form-data
```

**Form Fields:**
- `image`: Image file (required)
- `top_k`: Number of results (default: 10)
- `category`: Category filter (optional)

### Sketch Search

```
POST /api/search/sketch
Content-Type: multipart/form-data
```

**Form Fields:**
- `sketch`: Sketch image file (required)
- `top_k`: Number of results (default: 10)
- `category`: Category filter (optional)

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error description"
}
```

Common HTTP status codes:
- `400`: Bad request (invalid input, index not built)
- `422`: Validation error (invalid parameters)
- `500`: Internal server error
