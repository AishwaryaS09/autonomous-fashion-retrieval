import React, { useState } from "react";
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Describe what you're looking for
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. red floral summer dress, blue denim jacket..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fashion-500 focus:border-fashion-500 outline-none text-gray-900 placeholder-gray-400"
          disabled={loading}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fashion-500 focus:border-fashion-500 outline-none"
            disabled={loading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Results
          </label>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fashion-500 focus:border-fashion-500 outline-none"
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
        className="w-full bg-fashion-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-fashion-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default TextSearch;
