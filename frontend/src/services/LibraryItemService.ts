import type {
  LibraryItem,
  LibraryItemInput,
  LibrarySort,
} from "../types/library";
import type {
  AvailabilityHistoryPoint,
  ChartPeriod,
} from "../utils/dashboardChartData";
import api from "./axios";
import API_BASE_URL from "../api";

const LIBRARY_ITEMS_URL = `${API_BASE_URL}/library-items`;
const LOANS_URL = `${API_BASE_URL}/loans`;

export async function borrowLibraryItem(id: string, _borrower?: string) {
  return api.post<LibraryItem>(`${LOANS_URL}/${id}/borrow`);
}

export async function returnLibraryItem(id: string) {
  return api.post<LibraryItem>(`${LOANS_URL}/${id}/return`);
}

export async function getLibraryItems(sort: LibrarySort = "title-asc") {
  return api.get<LibraryItem[]>(LIBRARY_ITEMS_URL, {
    params: {
      sort,
    },
  });
}

export async function getLibraryItem(id: string) {
  return api.get<LibraryItem>(`${LIBRARY_ITEMS_URL}/${id}`);
}

export async function createLibraryItem(data: LibraryItemInput) {
  return api.post<LibraryItem>(LIBRARY_ITEMS_URL, data);
}

export async function updateLibraryItem(id: string, data: LibraryItemInput) {
  return api.put<LibraryItem>(`${LIBRARY_ITEMS_URL}/${id}`, data);
}

export async function deleteLibraryItem(id: string) {
  return api.delete(`${LIBRARY_ITEMS_URL}/${id}`);
}

export async function getAvailabilityHistory(period: ChartPeriod) {
  return api.get<AvailabilityHistoryPoint[]>(
    `${LOANS_URL}/availability-history`,
    {
      params: {
        period,
      },
    },
  );
}
