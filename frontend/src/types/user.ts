export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
};

export type ManagedUsersResponse = {
  users: ManagedUser[];
};

export type ManagedUserResponse = {
  message?: string;
  user: ManagedUser;
};
