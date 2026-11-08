export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  gender: "MAN" | "WOMAN" | null;
  isActive: boolean;
  createdAt: string;
};

export type ManagedUsersResponse = {
  users: ManagedUser[];
};

export type ManagedUserResponse = {
  message?: string;
  user: ManagedUser;
};
