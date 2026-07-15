# Fashion Catalog Data

## Directory Structure

```
data/
├── catalog/
│   ├── dresses/
│   ├── shirts/
│   ├── jackets/
│   ├── pants/
│   ├── shoes/
│   └── bags/
├── metadata/
│   └── products.json
└── README.md
```

## Adding Your Own Images

1. Place images in the appropriate category folder under `data/catalog/`.
2. Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
3. Name files descriptively (e.g., `red_floral_dress.jpg`). The filename stem becomes the product ID.
4. Optionally add metadata entries in `data/metadata/products.json`.

## Metadata Format

Each entry in `products.json`:

```json
{
  "id": "dress_001",
  "name": "Red Floral Dress",
  "category": "dresses",
  "color": "red",
  "pattern": "floral"
}
```

The system works even without metadata. Directory names are used as categories.

## Sample Dataset Sources

This project does not include copyrighted images. Use small samples from:

### DeepFashion2
- https://github.com/switchablenorms/DeepFashion2
- Download a small subset of the query/eval images
- Place relevant clothing images in the appropriate category folders

### FashionIQ
- https://github.com/XiaoxiaoGuo/FashionIQ
- Use the clothing images from the dataset
- Place in the corresponding category directories

### Polyvore
- Note: Polyvore dataset may require special access
- Use any small fashion image collection as a substitute

## Tips

- Aim for at least 5-10 images per category for meaningful results
- Higher resolution images (256x256 or larger) work better
- Images with clean backgrounds produce better embeddings
- The more images you add, the better the retrieval quality
