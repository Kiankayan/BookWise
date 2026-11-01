import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types/auth";
import { loginUser } from "../services/AuthService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("bookwise-user");
    return savedUser ? (JSON.parse(savedUser) as User) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("bookwise-token");
  });

  useEffect(() => {
    if (user && token) {
      localStorage.setItem("bookwise-user", JSON.stringify(user));
      localStorage.setItem("bookwise-token", token);
    } else {
      localStorage.removeItem("bookwise-user");
      localStorage.removeItem("bookwise-token");
    }
  }, [user, token]);

  const login = async (email: string, password: string) => {
    const response = await loginUser(email, password);

    setToken(response.data.token);
    setUser(response.data.user);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth måste användas inom AuthProvider.");
  }

  return context;
}
