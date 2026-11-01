import type { Category } from "../types/library";
import api from "./axios";
import API_BASE_URL from "../api";

const API_URL = `${API_BASE_URL}/categories`;

export async function getCategories() {
  return api.get<Category[]>(API_URL);
}

export async function createCategory(name: string) {
  return api.post<Category>(API_URL, {
    name,
  });
}

export async function updateCategory(id: string, name: string) {
  return api.put<Category>(`${API_URL}/${id}`, {
    name,
  });
}

export async function deleteCategory(id: string) {
  return api.delete(`${API_URL}/${id}`);
}
