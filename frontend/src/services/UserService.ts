import api from "./axios";
import API_BASE_URL from "../api";
import type { User } from "../types/auth";
import type {
  ManagedUser,
  ManagedUsersResponse,
  ManagedUserResponse,
} from "../types/user";

const USERS_URL = `${API_BASE_URL}/users`;

export async function getUsers() {
  return api.get<ManagedUsersResponse>(USERS_URL);
}

export async function getUserById(id: string) {
  return api.get<ManagedUserResponse>(`${USERS_URL}/${id}`);
}

export async function updateUserRole(id: string, role: ManagedUser["role"]) {
  return api.patch<ManagedUserResponse>(`${USERS_URL}/${id}/role`, {
    role,
  });
}

export async function updateUserStatus(id: string, isActive: boolean) {
  return api.patch<ManagedUserResponse>(`${USERS_URL}/${id}/status`, {
    isActive,
  });
}

export async function deleteUser(id: string) {
  return api.delete<{ message: string }>(`${USERS_URL}/${id}`);
}

export async function updateMyProfile(data: {
  name: string;
  email: string;
  avatarUrl?: string | null;
}) {
  return api.put<{ message: string; user: User }>(
    `${API_BASE_URL}/profile/me`,
    data,
  );
}
