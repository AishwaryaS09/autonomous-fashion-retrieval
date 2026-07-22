import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col items-center space-y-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-[80%]">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-primary-lighter rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-primary hover:bg-primary-lighter/5"
        >
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.img
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                src={preview}
                alt="Preview"
                className="max-h-56 mx-auto rounded-xl object-contain"
              />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4"
              >
                <div className="w-16 h-16 bg-primary-lighter/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-primary-dark/60">Click to upload an image</p>
                <p className="text-xs text-primary-light mt-1">JPG, PNG, WebP</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
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
        disabled={loading || !selectedFile}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Search by Image
          </>
        )}
      </button>
    </motion.form>
  );
};

export default ImageSearch;
