import type {
  LibraryItem,
  LibraryItemInput,
  LibrarySort,
} from "../types/library";
import axios from "axios";

const API_BASEURL = "http://localhost:5001/api/library-items";

export async function borrowLibraryItem(id: string, borrower: string) {
  return axios.post<LibraryItem>(`${API_BASEURL}/${id}/borrow`, {
    borrower,
  });
}

export async function returnLibraryItem(id: string) {
  return axios.post<LibraryItem>(`${API_BASEURL}/${id}/return`);
}

export async function getLibraryItems(sort: LibrarySort = "title-asc") {
  return axios.get<LibraryItem[]>(API_BASEURL, {
    params: {
      sort,
    },
  });
}

export async function createLibraryItem(data: LibraryItemInput) {
  return axios.post<LibraryItem>(API_BASEURL, data);
}

export async function updateLibraryItem(id: string, data: LibraryItemInput) {
  return axios.put<LibraryItem>(`${API_BASEURL}/${id}`, data);
}

export async function deleteLibraryItem(id: string) {
  return axios.delete(`${API_BASEURL}/${id}`);
}
