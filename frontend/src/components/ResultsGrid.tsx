import React from "react";
import ResultCard from "./ResultCard";
import type { SearchProduct } from "../types/search";

interface ResultsGridProps {
  results: SearchProduct[];
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No results found</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{results.length} results found</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((product, idx) => (
          <ResultCard key={product.id} product={product} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
};

export default ResultsGrid;
