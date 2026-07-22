import React from "react";
import { motion } from "framer-motion";
import ResultCard from "./ResultCard";
import type { SearchProduct } from "../types/search";

interface ResultsGridProps {
  results: SearchProduct[];
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 text-primary-dark/25"
      >
        <p className="text-sm font-medium">No results found</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-[11px] text-primary-dark/40 font-semibold mb-6 uppercase tracking-widest">
        {results.length} results found
      </p>
      <div className="flex flex-col gap-6">
        {results.map((product, idx) => (
          <ResultCard key={product.id} product={product} rank={idx + 1} />
        ))}
      </div>
    </motion.div>
  );
};

export default ResultsGrid;
