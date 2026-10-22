import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { getLibraryItems } from "./services/LibraryItemService";
import { getCategories } from "./services/CategoryService";
import type { Category, LibraryItem, LibrarySort } from "./types/library";
import AppLayout from "./components/AppLayout";
import LoadingScreen from "./components/LoadingScreen";
import DashboardPage from "./pages/DashboardPage";
import LibraryPage from "./pages/LibraryPage";
import CategoriesPage from "./pages/CategoriesPage";
import AddItemPage from "./pages/AddItemPage";
import "./App.css";

function App() {
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
    async function loadInitialData() {
      const startTime = Date.now();

      try {
        await Promise.all([loadCategories(), loadLibraryItems()]);
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 3000 - elapsedTime);

        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);
      }
    }

    void loadInitialData();
  }, [loadCategories, loadLibraryItems]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {libraryItemsError && (
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
      </Routes>
    </>
  );
}

export default App;
