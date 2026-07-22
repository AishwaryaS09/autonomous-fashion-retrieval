import React from "react";
import { motion } from "framer-motion";
import { API_BASE } from "../services/api";
import type { SearchProduct } from "../types/search";

interface ResultCardProps {
  product: SearchProduct;
  rank: number;
}

const MetaTag: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  if (!value || value.trim() === "") return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold text-primary-dark/40 uppercase tracking-wider min-w-[80px]">
        {label}
      </span>
      <span className="text-sm font-medium text-primary-dark">{value}</span>
    </div>
  );
};

const ResultCard: React.FC<ResultCardProps> = ({ product, rank }) => {
  const imageUrl = `${API_BASE}${product.image_url}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: rank * 0.06 }}
      className="card card-hover overflow-hidden"
    >
      <div className="flex flex-col md:flex-row">
        {/* Product Info - Left */}
        <div className="flex-1 p-7 flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-lg font-semibold text-primary-dark leading-tight">
                {product.name}
              </h3>
            </div>

            {product.description && (
              <p className="text-sm text-primary-dark/50 mb-4 leading-relaxed">
                {product.description}
              </p>
            )}

            {!product.description && <div className="mb-4" />}

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              <MetaTag label="Category" value={product.category} />
              <MetaTag label="Gender" value={product.gender} />
              <MetaTag label="Material" value={product.material} />
              <MetaTag label="Color" value={product.primary_color || product.color} />
              <MetaTag label="Secondary" value={product.secondary_color} />
              <MetaTag label="Pattern" value={product.pattern} />
              <MetaTag label="Style" value={product.style} />
              <MetaTag label="Season" value={product.season} />
              <MetaTag label="Occasion" value={product.occasion} />
              <MetaTag label="Fit" value={product.fit} />
            </div>
          </div>

          {/* Score Badges */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex items-center gap-1.5 bg-primary-lighter/20 text-primary-dark rounded-full px-4 py-1.5">
              <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-[11px] font-semibold text-primary-dark/50 uppercase tracking-wider">Similarity</span>
              <span className="text-sm font-bold text-primary">{(product.similarity_score * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 text-primary-dark rounded-full px-4 py-1.5">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[11px] font-semibold text-primary-dark/50 uppercase tracking-wider">Score</span>
              <span className="text-sm font-bold text-green-600">{(product.reranking_score * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Image - Right */}
        <div className="relative md:w-[260px] flex-shrink-0">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-56 md:h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMjAiIGhlaWdodD0iMjIwIj48cmVjdCBmaWxsPSIjRjlGOUY5IiB3aWR0aD0iMjIwIiBoZWlnaHQ9IjIyMCIvPjx0ZXh0IGZpbGw9IiNFNDIyNzgiIGZvbnQtZmFtaWx5PSJQb3BwaW5zIiBmb250LXNpemU9IjEyIiB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
            }}
          />
          {/* Rank Badge */}
          <div className="absolute top-4 right-4">
            <div className="w-10 h-10 bg-primary-dark/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
              #{rank}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultCard;
