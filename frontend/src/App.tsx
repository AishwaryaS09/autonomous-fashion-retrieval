import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import SearchTabs from "./components/SearchTabs";
import TextSearch from "./components/TextSearch";
import ImageSearch from "./components/ImageSearch";
import SketchCanvas from "./components/SketchCanvas";
import ResultsGrid from "./components/ResultsGrid";
import LoadingState from "./components/LoadingState";
import ErrorMessage from "./components/ErrorMessage";
import {
  searchByText,
  searchByImage,
  searchBySketch,
  healthCheck,
  getIndexStatus,
  buildIndex,
} from "./services/api";
import type { SearchTab, SearchProduct, IndexStatus } from "./types/search";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SearchTab>("text");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendUp, setBackendUp] = useState(true);
  const [indexStatus, setIndexStatus] = useState<IndexStatus | null>(null);
  const [buildingIndex, setBuildingIndex] = useState(false);
  const [queryType, setQueryType] = useState<string>("");
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    const up = await healthCheck();
    setBackendUp(up);
    if (up) {
      try {
        const status = await getIndexStatus();
        setIndexStatus(status);
      } catch {
        setIndexStatus(null);
      }
    }
  };

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleBuildIndex = async () => {
    setBuildingIndex(true);
    setError(null);
    try {
      const result = await buildIndex();
      setIndexStatus({
        status: "ready",
        num_products: result.num_products,
        embedding_dimension: 0,
        model_name: "fashion-clip",
      });
      alert(result.message);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to build index");
    } finally {
      setBuildingIndex(false);
    }
  };

  const handleTextSearch = async (query: string, topK: number, category?: string) => {
    setLoading(true);
    setError(null);
    setQueryType("text");
    try {
      const res = await searchByText({ query, top_k: topK, category });
      setResults(res.results);
      scrollToResults();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Search failed. Is the backend running?");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSearch = async (file: File, topK: number, category?: string) => {
    setLoading(true);
    setError(null);
    setQueryType("image");
    try {
      const res = await searchByImage(file, topK, category);
      setResults(res.results);
      scrollToResults();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Image search failed.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSketchSearch = async (file: File, topK: number, category?: string) => {
    setLoading(true);
    setError(null);
    setQueryType("sketch");
    try {
      const res = await searchBySketch(file, topK, category);
      setResults(res.results);
      scrollToResults();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Sketch search failed.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!backendUp) {
    return (
      <div className="min-h-screen bg-surface-muted">
        <Navbar />
        <div className="pt-[72px]">
          <div className="max-w-[1200px] mx-auto px-8 py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-12 text-center max-w-[80%] mx-auto"
            >
              <div className="w-20 h-20 bg-primary-lighter/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-primary-dark mb-3">
                Backend Unavailable
              </h2>
              <p className="text-primary-dark/50 text-sm mb-5 max-w-md mx-auto leading-relaxed">
                Could not connect to the Fashion Retrieval API at localhost:8000.
              </p>
              <p className="text-xs text-primary-dark/30 mb-6">
                Start the backend with:{" "}
                <code className="bg-surface-muted px-3 py-1.5 rounded-xl text-primary font-medium">
                  cd backend && uvicorn app.main:app --reload
                </code>
              </p>
              <button onClick={checkBackend} className="btn-primary px-8 py-3">
                Retry Connection
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar />
      <div className="pt-[72px]">
        <div className="max-w-[1200px] mx-auto px-8 py-10">
          {/* Index Status */}
          {indexStatus && indexStatus.status !== "ready" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[80%] mx-auto bg-primary-lighter/15 border border-primary-lighter/40 rounded-2xl p-5 mb-10 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-primary-dark font-semibold text-sm">FAISS Index Not Built</p>
                  <p className="text-primary-dark/50 text-xs mt-0.5">
                    Build the index to enable search. This encodes all catalog images using FashionCLIP.
                  </p>
                </div>
              </div>
              <button
                onClick={handleBuildIndex}
                disabled={buildingIndex}
                className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap"
              >
                {buildingIndex ? "Building..." : "Build Index"}
              </button>
            </motion.div>
          )}

          {indexStatus && indexStatus.status === "ready" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[80%] mx-auto bg-green-50 border border-green-200/60 rounded-2xl p-4 mb-10 flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-green-700 font-semibold text-sm">Index Ready</p>
                <p className="text-green-600 text-xs">{indexStatus.num_products} Products Indexed</p>
              </div>
            </motion.div>
          )}

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card p-10 mb-12 max-w-[80%] mx-auto"
          >
            <h2 className="text-2xl font-semibold text-primary-dark text-center mb-8">
              Search Fashion Catalog
            </h2>
            <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === "text" && <TextSearch onSearch={handleTextSearch} loading={loading} />}
            {activeTab === "image" && <ImageSearch onSearch={handleImageSearch} loading={loading} />}
            {activeTab === "sketch" && <SketchCanvas onSearch={handleSketchSearch} loading={loading} />}
          </motion.div>

          {/* Error */}
          {error && <div className="mb-8"><ErrorMessage message={error} /></div>}

          {/* Loading */}
          {loading && <LoadingState />}

          {/* Results */}
          <div ref={resultsRef}>
            {!loading && results.length > 0 && (
              <ResultsGrid results={results} />
            )}
          </div>

          {!loading && results.length === 0 && !error && queryType && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-primary-dark/25"
            >
              <p className="text-sm font-medium">No results found. Try a different query.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
