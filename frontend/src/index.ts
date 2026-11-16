export { default as LibraryItemFields } from "./components/LibraryItemFields";
export { default as ImageDropzone } from "./components/ImageDropzone";

export { createLibraryItem } from "./services/LibraryItemService";
export { uploadLibraryItemImage } from "./services/ImageUploadService";

export type { Category, LibraryItemType } from "./types/library";

export { libraryItemSchema } from "./schemas/libraryItemSchema";

export { buildLibraryItemFormData } from "./utils/libraryItemFormUtils";

export { useAuth } from "./context/AuthContext";

export {
  borrowLibraryItem,
  returnLibraryItem,
  deleteLibraryItem,
} from "./services/LibraryItemService";

export type { LibraryItem, LibrarySort } from "./types/library";

export { default as BookDetailsModal } from "./components/BookDetailsModal";
export { default as LibraryToolbar } from "./components/LibraryToolbar";
export { default as LibraryItemCard } from "./components/LibraryItemCard";
export { default as LibraryItemDialogs } from "./components/LibraryItemDialogs";

export { getTypeLabel } from "./utils/libraryItemHelpers";

export { getLibraryItems } from "./services/LibraryItemService";
export { getCategories } from "./services/CategoryService";

export { default as AppLayout } from "./components/AppLayout";
export { default as LoadingScreen } from "./components/LoadingScreen";
export { default as ProtectedRoute } from "./components/ProtectedRoute";
export { default as AdminRoute } from "./components/AdminRoute";

export { default as DashboardPage } from "./pages/DashboardPage";
export { default as UserDashboardPage } from "./pages/UserDashboardPage";
export { default as LibraryPage } from "./pages/LibraryPage";
export { default as CategoriesPage } from "./pages/CategoriesPage";
export { default as AddItemPage } from "./pages/AddItemPage";
export { default as LoginPage } from "./pages/LoginPage";
export { default as RegisterPage } from "./pages/RegisterPage";
export { default as ForgotPasswordPage } from "./pages/ForgotPasswordPage";
export { default as ResetPasswordPage } from "./pages/ResetPasswordPage";
export { default as MyLoansPage } from "./pages/MyLoansPage";
export { default as ProfilePage } from "./pages/ProfilePage";
export { default as UsersPage } from "./pages/UsersPage";
export { default as UserDetailsPage } from "./pages/UserDetailsPage";
export { default as SettingsPage } from "./pages/SettingsPage";
