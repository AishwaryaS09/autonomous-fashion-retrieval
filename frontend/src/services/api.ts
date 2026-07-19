import axios from "axios";
import type { SearchResponse, TextSearchRequest, IndexStatus, CatalogResponse } from "../types/search";

const API_BASE = import.meta.env.VITE_API_BASE || "https://autonomous-fashion-retrieval.onrender.com";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await api.get("/health");
    return res.data.status === "ok";
  } catch {
    return false;
  }
}

export async function getIndexStatus(): Promise<IndexStatus> {
  const res = await api.get("/api/index/status");
  return res.data;
}

export async function buildIndex(): Promise<{ status: string; num_products: number; message: string }> {
  const res = await api.post("/api/index/build");
  return res.data;
}

export async function getCatalog(): Promise<CatalogResponse> {
  const res = await api.get("/api/catalog");
  return res.data;
}

export async function searchByText(request: TextSearchRequest): Promise<SearchResponse> {
  const res = await api.post("/api/search/text", request);
  return res.data;
}

export async function searchByImage(
  file: File,
  topK: number = 10,
  category?: string
): Promise<SearchResponse> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("top_k", topK.toString());
  if (category) formData.append("category", category);
  const res = await api.post("/api/search/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function searchBySketch(
  file: File,
  topK: number = 10,
  category?: string
): Promise<SearchResponse> {
  const formData = new FormData();
  formData.append("sketch", file);
  formData.append("top_k", topK.toString());
  if (category) formData.append("category", category);
  const res = await api.post("/api/search/sketch", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export { API_BASE };
