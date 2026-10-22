import axios from "axios";
import type { Category } from "../types/library";

const API_BASEURL =
  "https://certifieringsprov-bibliotek-backend.onrender.com/api/categories";

export async function getCategories() {
  return axios.get<Category[]>(API_BASEURL);
}

export async function createCategory(name: string) {
  return axios.post<Category>(API_BASEURL, {
    name,
  });
}

export async function updateCategory(id: string, name: string) {
  return axios.put<Category>(`${API_BASEURL}/${id}`, {
    name,
  });
}

export async function deleteCategory(id: string) {
  return axios.delete(`${API_BASEURL}/${id}`);
}
