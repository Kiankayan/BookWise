import axios from "axios";
import type { Category } from "../types/library";
import API_BASE_URL from "../api";

const API_BASEURL = `${API_BASE_URL}/categories`;
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
