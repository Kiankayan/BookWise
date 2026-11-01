import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { user } = useAuth();

  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    if (!user) {
      setThemeState("light");
      return;
    }

    const savedTheme = localStorage.getItem(`bookwise-theme-${user.id}`);

    setThemeState(savedTheme === "dark" ? "dark" : "light");
  }, [user?.id]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    if (user) {
      localStorage.setItem(`bookwise-theme-${user.id}`, newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme måste användas inom ThemeProvider.");
  }

  return context;
}
