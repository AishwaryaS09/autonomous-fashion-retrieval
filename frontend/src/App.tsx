import React, { useState, useEffect } from "react";
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
    } catch (err: any) {
      setError(err.response?.data?.detail || "Sketch search failed.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!backendUp) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Backend Unavailable
            </h2>
            <p className="text-gray-500 mb-4">
              Could not connect to the Fashion Retrieval API at localhost:8000.
            </p>
            <p className="text-sm text-gray-400">
              Start the backend with: <code className="bg-gray-100 px-2 py-1 rounded">cd backend && uvicorn app.main:app --reload</code>
            </p>
            <button
              onClick={checkBackend}
              className="mt-4 px-4 py-2 bg-fashion-600 text-white rounded-lg hover:bg-fashion-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Index status banner */}
        {indexStatus && indexStatus.status !== "ready" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-yellow-800 font-medium">FAISS Index Not Built</p>
              <p className="text-yellow-600 text-sm">
                Build the index to enable search. This encodes all catalog images using FashionCLIP.
              </p>
            </div>
            <button
              onClick={handleBuildIndex}
              disabled={buildingIndex}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors text-sm"
            >
              {buildingIndex ? "Building..." : "Build Index"}
            </button>
          </div>
        )}

        {indexStatus && indexStatus.status === "ready" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm text-green-700">
            Index ready: {indexStatus.num_products} products indexed
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Fashion Catalog</h2>
          <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "text" && <TextSearch onSearch={handleTextSearch} loading={loading} />}
          {activeTab === "image" && <ImageSearch onSearch={handleImageSearch} loading={loading} />}
          {activeTab === "sketch" && <SketchCanvas onSearch={handleSketchSearch} loading={loading} />}
        </div>

        {error && <ErrorMessage message={error} />}
        {loading && <LoadingState />}

        {!loading && results.length > 0 && (
          <ResultsGrid results={results} />
        )}

        {!loading && results.length === 0 && !error && queryType && (
          <div className="text-center py-12 text-gray-400">
            <p>No results found. Try a different query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
