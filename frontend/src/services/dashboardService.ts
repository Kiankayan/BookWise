import api from "./axios";
import API_BASE_URL from "../api";

const API_URL = `${API_BASE_URL}/dashboard`;

export type DashboardStat = {
  key: string;
  current: number;
  previous: number | null;
  change: number | null;
};

export type DashboardStatsResponse = {
  stats: DashboardStat[];
  hasPreviousMonthHistory: boolean;
};

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const response = await api.get<DashboardStatsResponse>(`${API_URL}/stats`);

  return response.data;
}
