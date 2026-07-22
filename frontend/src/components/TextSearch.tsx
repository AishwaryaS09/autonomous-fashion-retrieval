import React, { useState } from "react";
import { motion } from "framer-motion";
import { CATEGORIES } from "../types/search";

interface TextSearchProps {
  onSearch: (query: string, topK: number, category?: string) => void;
  loading: boolean;
}

const TextSearch: React.FC<TextSearchProps> = ({ onSearch, loading }) => {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(10);
  const [category, setCategory] = useState("All");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim(), topK, category === "All" ? undefined : category);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col items-center space-y-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-[80%]">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. red floral summer dress, blue denim jacket..."
            className="input-field h-[55px] pl-12"
            disabled={loading}
          />
        </div>
      </div>

      <div className="w-[80%] flex gap-4">
        <div className="w-[80%]">
          <label className="label-text">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field h-[50px]"
            disabled={loading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="w-[20%]">
          <label className="label-text">Results</label>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="input-field h-[50px]"
            disabled={loading}
          >
            {[5, 10, 20, 50].map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="btn-primary w-[80%] h-[55px] flex items-center justify-center gap-2 text-base"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </>
        )}
      </button>
    </motion.form>
  );
};

export default TextSearch;
