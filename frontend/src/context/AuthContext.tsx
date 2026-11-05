import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
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
const INACTIVITY_LIMIT = 60 * 60 * 1000;
const LAST_ACTIVITY_KEY = "bookwise-last-activity";

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!user || !token) {
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const checkInactivity = () => {
      const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));

      const inactiveTime = Date.now() - lastActivity;

      if (!lastActivity || inactiveTime >= INACTIVITY_LIMIT) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      timeoutId = setTimeout(checkInactivity, INACTIVITY_LIMIT - inactiveTime);
    };

    const handleActivity = () => {
      const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));

      if (lastActivity && Date.now() - lastActivity >= INACTIVITY_LIMIT) {
        checkInactivity();
        return;
      }

      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkInactivity, INACTIVITY_LIMIT);
    };

    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }

    checkInactivity();

    const activityEvents = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "mousemove",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    window.addEventListener("focus", handleActivity);

    return () => {
      clearTimeout(timeoutId);

      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      window.removeEventListener("focus", handleActivity);
    };
  }, [user, token, navigate]);

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
