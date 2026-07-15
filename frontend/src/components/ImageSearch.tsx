import React, { useRef, useState } from "react";
import { CATEGORIES } from "../types/search";

interface ImageSearchProps {
  onSearch: (file: File, topK: number, category?: string) => void;
  loading: boolean;
}

const ImageSearch: React.FC<ImageSearchProps> = ({ onSearch, loading }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [topK, setTopK] = useState(10);
  const [category, setCategory] = useState("All");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    onSearch(selectedFile, topK, category === "All" ? undefined : category);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload a fashion image
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-fashion-500 transition-colors"
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg object-contain"
            />
          ) : (
            <div className="text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>Click to upload an image</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
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
        disabled={loading || !selectedFile}
        className="w-full bg-fashion-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-fashion-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Searching..." : "Search by Image"}
      </button>
    </form>
  );
};

export default ImageSearch;
