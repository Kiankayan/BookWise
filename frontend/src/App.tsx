import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { getLibraryItems } from "./services/LibraryItemService";
import { getCategories } from "./services/CategoryService";
import type { Category, LibraryItem, LibrarySort } from "./types/library";
import AppLayout from "./components/AppLayout";
import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LibraryPage from "./pages/LibraryPage";
import CategoriesPage from "./pages/CategoriesPage";
import AddItemPage from "./pages/AddItemPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./App.css";

function App() {
  const { isAuthenticated } = useAuth();

  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sort, setSort] = useState<LibrarySort>("title-asc");
  const [isLoading, setIsLoading] = useState(true);
  const [libraryItemsError, setLibraryItemsError] = useState("");

  const loadLibraryItems = useCallback(async () => {
    try {
      const response = await getLibraryItems(sort);
      setLibraryItems(response.data);
      setLibraryItemsError("");
    } catch (error) {
      console.error("Kunde inte hämta library items.", error);
      setLibraryItemsError(
        "Kunde inte hämta böcker från servern. Kontrollera att backend-servern är igång och försök igen.",
      );
    }
  }, [sort]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Kunde inte hämta kategorier.", error);
    }
  }, []);

  const handleCategoriesChanged = async () => {
    await loadCategories();
    await loadLibraryItems();
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setLibraryItems([]);
      setCategories([]);
      return;
    }

    async function loadInitialData() {
      const startTime = Date.now();

      setIsLoading(true);

      try {
        await Promise.all([loadCategories(), loadLibraryItems()]);
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1500 - elapsedTime);

        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);
      }
    }

    void loadInitialData();
  }, [isAuthenticated, loadCategories, loadLibraryItems]);

  if (isAuthenticated && isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {isAuthenticated && libraryItemsError && (
        <div
          role="alert"
          style={{
            padding: "16px",
            margin: "16px",
            border: "1px solid #dc2626",
            borderRadius: "8px",
            backgroundColor: "#fef2f2",
            color: "#991b1b",
          }}
        >
          <p>{libraryItemsError}</p>
          <button type="button" onClick={() => void loadLibraryItems()}>
            Försök igen
          </button>
        </div>
      )}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={
                <DashboardPage
                  libraryItems={libraryItems}
                  categories={categories}
                />
              }
            />

            <Route
              path="/library"
              element={
                <LibraryPage
                  libraryItems={libraryItems}
                  categories={categories}
                  sort={sort}
                  setSort={setSort}
                  onLibraryItemUpdated={loadLibraryItems}
                />
              }
            />

            <Route
              path="/categories"
              element={
                <CategoriesPage
                  categories={categories}
                  onCategoriesChanged={handleCategoriesChanged}
                />
              }
            />

            <Route
              path="/add-item"
              element={
                <AddItemPage
                  categories={categories}
                  onLibraryItemCreated={loadLibraryItems}
                />
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
