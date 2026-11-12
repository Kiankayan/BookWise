import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  borrowLibraryItem,
  returnLibraryItem,
  deleteLibraryItem,
} from "../services/LibraryItemService";
import type { Category, LibraryItem, LibrarySort } from "../types/library";
import BookDetailsModal from "./BookDetailsModal";
import LibraryToolbar from "./LibraryToolbar";
import LibraryItemCard from "./LibraryItemCard";
import LibraryItemDialogs from "./LibraryItemDialogs";
import { getTypeLabel } from "../utils/libraryItemHelpers";

interface LibraryItemListProps {
  libraryItems: LibraryItem[];
  categories: Category[];
  sort: LibrarySort;
  setSort: (sort: LibrarySort) => void;
  onLibraryItemUpdated: () => Promise<void>;
}

function LibraryItemList({
  libraryItems,
  categories,
  sort,
  setSort,
  onLibraryItemUpdated,
}: LibraryItemListProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const dateLocale = i18n.language.startsWith("sv") ? "sv-SE" : "en-US";

  const [showAbbreviations, setShowAbbreviations] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemToDelete, setItemToDelete] = useState<LibraryItem | null>(null);
  const [itemToBorrow, setItemToBorrow] = useState<LibraryItem | null>(null);
  const [itemToReturn, setItemToReturn] = useState<LibraryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredItems = libraryItems
    .filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.categoryId === selectedCategory;

      const matchesSearch =
        !normalizedSearchTerm ||
        item.title.toLowerCase().includes(normalizedSearchTerm) ||
        (item.author?.toLowerCase().includes(normalizedSearchTerm) ?? false);

      const matchesAvailability =
        selectedAvailability === "all" ||
        (selectedAvailability === "available" &&
          item.isBorrowable &&
          item.loans.length === 0) ||
        (selectedAvailability === "borrowed" &&
          item.isBorrowable &&
          item.loans.length > 0) ||
        (selectedAvailability === "reference" && !item.isBorrowable);

      return matchesCategory && matchesSearch && matchesAvailability;
    })
    .sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();

      if (normalizedSearchTerm) {
        const aStartsWithSearch = titleA.startsWith(normalizedSearchTerm);
        const bStartsWithSearch = titleB.startsWith(normalizedSearchTerm);

        if (aStartsWithSearch && !bStartsWithSearch) return -1;
        if (!aStartsWithSearch && bStartsWithSearch) return 1;
      }

      switch (sort) {
        case "title-asc":
          return titleA.localeCompare(titleB, dateLocale);

        case "title-desc":
          return titleB.localeCompare(titleA, dateLocale);

        case "category":
          return a.category.name.localeCompare(b.category.name, dateLocale);

        case "type":
          return getTypeLabel(a.type, (key) => t(key)).localeCompare(
            getTypeLabel(b.type, (key) => t(key)),
            dateLocale,
          );

        default:
          return 0;
      }
    });

  function handleBorrow(item: LibraryItem) {
    setItemToBorrow(item);
  }

  function closeBorrowDialog() {
    setItemToBorrow(null);
  }

  async function confirmBorrow() {
    if (!itemToBorrow) return;

    try {
      await borrowLibraryItem(itemToBorrow.id);
      closeBorrowDialog();
      await onLibraryItemUpdated();
      toast.success(t("library.borrowSuccess"));
    } catch (error) {
      console.error("Could not borrow library item.", error);
      toast.error(t("library.borrowError"));
    }
  }

  function handleReturn(item: LibraryItem) {
    setItemToReturn(item);
  }

  async function confirmReturn() {
    if (!itemToReturn) return;

    try {
      await returnLibraryItem(itemToReturn.id);
      setItemToReturn(null);
      await onLibraryItemUpdated();
      toast.success(t("library.returnSuccess"));
    } catch (error) {
      console.error("Could not return library item.", error);
      toast.error(t("library.returnError"));
    }
  }

  async function handleDelete() {
    if (!itemToDelete) return;

    console.log("Library item:", itemToDelete);
    console.log("Active loans:", itemToDelete.loans);
    console.log("Borrower:", itemToDelete.borrower);
    console.log("Borrow date:", itemToDelete.borrowDate);

    if (itemToDelete.loans.length > 0) {
      toast.error(t("library.cannotDeleteBorrowed"));
      return;
    }

    try {
      await deleteLibraryItem(itemToDelete.id);
      setItemToDelete(null);
      await onLibraryItemUpdated();
      toast.success(t("library.deleteSuccess"));
    } catch (error) {
      console.error("Could not delete library item.", error);
      toast.error(t("library.deleteError"));
    }
  }

  return (
    <div className="library-list">
      <LibraryToolbar
        categories={categories}
        sort={sort}
        setSort={setSort}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedAvailability={selectedAvailability}
        setSelectedAvailability={setSelectedAvailability}
        showAbbreviations={showAbbreviations}
        setShowAbbreviations={setShowAbbreviations}
      />

      <p className="library-results-count" aria-live="polite">
        {t("library.results", { count: filteredItems.length })}
      </p>

      <div className="library-items">
        {filteredItems.map((item, index) => (
          <LibraryItemCard
            key={item.id}
            item={item}
            index={index}
            categories={categories}
            isAdmin={isAdmin}
            userId={user?.id}
            dateLocale={dateLocale}
            showAbbreviations={showAbbreviations}
            editingItemId={editingItemId}
            onEdit={(item) => setEditingItemId(item.id)}
            onCancelEdit={() => setEditingItemId(null)}
            onBorrow={handleBorrow}
            onReturn={handleReturn}
            onDelete={setItemToDelete}
            onSelect={setSelectedItem}
            onLibraryItemUpdated={onLibraryItemUpdated}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className="library-empty-state">{t("library.emptyState")}</p>
      )}

      <LibraryItemDialogs
        itemToBorrow={itemToBorrow}
        itemToDelete={itemToDelete}
        itemToReturn={itemToReturn}
        userName={user?.name}
        onCloseBorrow={closeBorrowDialog}
        onCloseDelete={() => setItemToDelete(null)}
        onCloseReturn={() => setItemToReturn(null)}
        onConfirmBorrow={() => void confirmBorrow()}
        onConfirmDelete={() => void handleDelete()}
        onConfirmReturn={() => void confirmReturn()}
      />

      <BookDetailsModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}

export default LibraryItemList;
