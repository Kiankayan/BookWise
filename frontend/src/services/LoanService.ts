import type { Loan } from "../types/loan";
import api from "./axios";
import API_BASE_URL from "../api";

const LOANS_URL = `${API_BASE_URL}/loans`;

export async function getMyLoans() {
  return api.get<Loan[]>(`${LOANS_URL}/my-loans`);
}

export async function getRecentLoans() {
  return api.get<Loan[]>(`${LOANS_URL}/recent-loans`);
}
