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
import UserDashboardPage from "./pages/UserDashboardPage";
import LibraryPage from "./pages/LibraryPage";
import CategoriesPage from "./pages/CategoriesPage";
import AddItemPage from "./pages/AddItemPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import MyLoansPage from "./pages/MyLoansPage";
import ProfilePage from "./pages/ProfilePage";
import UsersPage from "./pages/UsersPage";
import UserDetailsPage from "./pages/UserDetailsPage";
import AdminRoute from "./components/AdminRoute";
import "./App.css";
import SettingsPage from "./pages/SettingsPage";
import { useTranslation } from "react-i18next";

function App() {
  const { isAuthenticated, isLoggingOut, user } = useAuth();
  const { t } = useTranslation();
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sort, setSort] = useState<LibrarySort>("title-asc");
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [libraryItemsError, setLibraryItemsError] = useState("");

  const loadLibraryItems = useCallback(async () => {
    try {
      const response = await getLibraryItems();
      setLibraryItems(response.data);
      setLibraryItemsError("");
    } catch (error) {
      console.error("Kunde inte hämta library items.", error);
      setLibraryItemsError(
        "Kunde inte hämta böcker från servern. Kontrollera att backend-servern är igång och försök igen.",
      );
    }
  }, []);

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
    const startTime = Date.now();

    const timeoutId = setTimeout(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1500 - elapsedTime);

      setTimeout(() => {
        setIsInitialLoading(false);
      }, remainingTime);
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, []);

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

  if (isLoggingOut) {
    return <LoadingScreen message={t("loadingScreen.loggingOut")} />;
  }

  if (isInitialLoading || (isAuthenticated && isLoading)) {
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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={
                user?.role === "ADMIN" ? (
                  <DashboardPage
                    libraryItems={libraryItems}
                    categories={categories}
                  />
                ) : (
                  <UserDashboardPage />
                )
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

            <Route path="/my-loans" element={<MyLoansPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route element={<AdminRoute />}>
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

              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/:id" element={<UserDetailsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
