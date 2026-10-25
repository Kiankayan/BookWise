import axios from "axios";

const API_URL = "http://localhost:5001/api/dashboard";

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
  const response = await axios.get<DashboardStatsResponse>(`${API_URL}/stats`);

  return response.data;
}
