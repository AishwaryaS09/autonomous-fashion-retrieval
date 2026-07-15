export interface SearchProduct {
  id: string;
  name: string;
  category: string;
  image_url: string;
  similarity_score: number;
  reranking_score: number;
  color: string;
  pattern: string;
}

export interface SearchResponse {
  query_type: "text" | "image" | "sketch";
  results: SearchProduct[];
}

export interface TextSearchRequest {
  query: string;
  top_k: number;
  category?: string;
}

export interface IndexStatus {
  status: string;
  num_products: number;
  embedding_dimension: number;
  model_name: string;
}

export interface CatalogResponse {
  products: SearchProduct[];
  total: number;
}

export type SearchTab = "text" | "image" | "sketch";

export const CATEGORIES = [
  "All",
  "dresses",
  "shirts",
  "jackets",
  "pants",
  "shoes",
  "bags",
] as const;
