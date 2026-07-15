import React from "react";
import { API_BASE } from "../services/api";
import type { SearchProduct } from "../types/search";

interface ResultCardProps {
  product: SearchProduct;
  rank: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ product, rank }) => {
  const imageUrl = `${API_BASE}${product.image_url}`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-56 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCBmaWxsPSIjZjNmNGY2IiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIvPjx0ZXh0IGZpbGw9IiM5Y2EzYWYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
          }}
        />
        <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          #{rank}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
        <p className="text-xs text-gray-500 mt-1 capitalize">{product.category}</p>
        {product.color && (
          <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {product.color}
          </span>
        )}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>Similarity: {(product.similarity_score * 100).toFixed(1)}%</span>
          <span className="font-medium text-fashion-600">
            Score: {(product.reranking_score * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
