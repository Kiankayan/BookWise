export type UserRole = "USER" | "ADMIN";
export type UserGender = "MAN" | "WOMAN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gender: UserGender | null;
  avatarUrl: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}
