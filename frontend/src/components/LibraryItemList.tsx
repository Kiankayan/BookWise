import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button as MuiButton,
} from "@mui/material";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  borrowLibraryItem,
  returnLibraryItem,
  deleteLibraryItem,
} from "../services/LibraryItemService";
import EditLibraryItemForm from "./EditLibraryItemForm";
import type { Category, LibraryItem, LibrarySort } from "../types/library";
import BookDetailsModal from "./BookDetailsModal";
import { getLibraryItemImage } from "../utils/libraryItemImage";

interface LibraryItemListProps {
  libraryItems: LibraryItem[];
  categories: Category[];
  sort: LibrarySort;
  setSort: (sort: LibrarySort) => void;
  onLibraryItemUpdated: () => Promise<void>;
}

function getTitleAbbreviation(title: string) {
  return title
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function isOverdue(dueDate: string | null) {
  if (!dueDate) {
    return false;
  }

  const date = new Date(dueDate);
  const today = new Date();

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return date < today;
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

  const getTypeLabel = (type: LibraryItem["type"]) => {
    switch (type) {
      case "BOOK":
        return t("library.book");
      case "DVD":
        return t("library.dvd");
      case "AUDIOBOOK":
        return t("library.audiobook");
      case "REFERENCE_BOOK":
        return t("library.referenceBook");
    }
  };

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
          return getTypeLabel(a.type).localeCompare(
            getTypeLabel(b.type),
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
      <div className="library-toolbar">
        <div className="library-search">
          <label htmlFor="library-search-input">
            {t("library.searchLabel")}
          </label>
          <input
            id="library-search-input"
            type="search"
            placeholder={t("library.searchPlaceholder")}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="sort-control">
          <label htmlFor="category-filter">{t("library.categoryFilter")}</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="all">{t("library.allCategories")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sort-control">
          <label htmlFor="availability-filter">
            {t("library.availability")}
          </label>
          <select
            id="availability-filter"
            value={selectedAvailability}
            onChange={(event) => setSelectedAvailability(event.target.value)}
          >
            <option value="all">{t("library.allMaterials")}</option>
            <option value="available">{t("library.available")}</option>
            <option value="borrowed">{t("library.borrowed")}</option>
            <option value="reference">{t("library.reference")}</option>
          </select>
        </div>

        <div className="sort-control">
          <label htmlFor="sort">{t("library.sortBy")}</label>

          <select
            id="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as LibrarySort)}
          >
            <option value="title-asc">{t("library.titleAsc")}</option>
            <option value="title-desc">{t("library.titleDesc")}</option>
            <option value="category">{t("library.categoryAsc")}</option>
            <option value="type">{t("library.type")}</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowAbbreviations(!showAbbreviations)}
        >
          {showAbbreviations
            ? t("library.showFullTitles")
            : t("library.showAbbreviatedTitles")}
        </button>
      </div>

      <p className="library-results-count" aria-live="polite">
        {t("library.results", { count: filteredItems.length })}
      </p>

      <div className="library-items">
        {filteredItems.map((item, index) => {
          const activeLoan = item.loans[0];

          return (
            <motion.div
              className="library-item"
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.015 }}
              transition={{
                duration: 0.25,
                delay: Math.min(index * 0.08, 0.48),
                ease: "easeOut",
              }}
              onClick={(event) => {
                if (
                  event.target instanceof Element &&
                  event.target.closest("button, input, select, textarea, a")
                ) {
                  return;
                }

                if (editingItemId !== item.id) {
                  setSelectedItem(item);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={t("library.detailsAriaLabel", {
                title: item.title,
              })}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;

                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedItem(item);
                }
              }}
            >
              {editingItemId === item.id ? (
                <EditLibraryItemForm
                  item={item}
                  categories={categories}
                  onLibraryItemUpdated={onLibraryItemUpdated}
                  onCancel={() => setEditingItemId(null)}
                />
              ) : (
                <>
                  <img
                    className="library-item-image"
                    src={getLibraryItemImage(item)}
                    alt={t("library.coverAlt", { title: item.title })}
                    loading="lazy"
                  />

                  <h2>
                    {showAbbreviations
                      ? `${item.title} (${getTitleAbbreviation(item.title)})`
                      : item.title}
                  </h2>

                  <p>
                    {t("library.typeLabel")} {getTypeLabel(item.type)}
                  </p>
                  <p>
                    {t("library.categoryLabel")} {item.category.name}
                  </p>

                  {item.isBorrowable ? (
                    activeLoan ? (
                      <>
                        <p>
                          {t("library.borrowedTo")}{" "}
                          {activeLoan?.borrowerName ?? "-"}
                        </p>

                        <p>
                          {t("library.borrowDate")}{" "}
                          {activeLoan?.borrowDate
                            ? new Date(
                                activeLoan.borrowDate,
                              ).toLocaleDateString(dateLocale)
                            : "-"}
                        </p>

                        <p>
                          {t("library.dueDate")}{" "}
                          {activeLoan?.dueDate
                            ? new Date(activeLoan.dueDate).toLocaleDateString(
                                dateLocale,
                              )
                            : "-"}
                        </p>

                        {isOverdue(activeLoan?.dueDate ?? null) ? (
                          <p className="overdue-label" role="status">
                            {t("library.overdue")}
                          </p>
                        ) : (
                          <p className="borrowed-label" role="status">
                            {t("library.borrowedStatus")}
                          </p>
                        )}

                        <div className="library-item-actions">
                          {(isAdmin || item.loans[0]?.userId === user?.id) && (
                            <button
                              type="button"
                              className="library-action-button"
                              onClick={() => handleReturn(item)}
                            >
                              {t("library.return")}
                            </button>
                          )}

                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                className="library-action-button"
                                onClick={() => setEditingItemId(item.id)}
                              >
                                {t("library.edit")}
                              </button>

                              <button
                                type="button"
                                className="library-action-button"
                                onClick={() => setItemToDelete(item)}
                              >
                                {t("library.delete")}
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="available-label" role="status">
                          {t("library.notBorrowed")}
                        </p>

                        <div className="library-item-actions">
                          <button
                            type="button"
                            className="library-action-button"
                            onClick={() => handleBorrow(item)}
                          >
                            {t("library.borrow")}
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                className="library-action-button"
                                onClick={() => setEditingItemId(item.id)}
                              >
                                {t("library.edit")}
                              </button>

                              <button
                                type="button"
                                className="library-action-button"
                                onClick={() => setItemToDelete(item)}
                              >
                                {t("library.delete")}
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )
                  ) : (
                    <>
                      <p>{t("library.referenceDescription")}</p>

                      {isAdmin && (
                        <div className="library-item-actions">
                          <button
                            type="button"
                            className="library-action-button"
                            onClick={() => setEditingItemId(item.id)}
                          >
                            {t("library.edit")}
                          </button>

                          <button
                            type="button"
                            className="library-action-button"
                            onClick={() => setItemToDelete(item)}
                          >
                            {t("library.delete")}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <p className="library-empty-state">{t("library.emptyState")}</p>
      )}

      <Dialog
        open={itemToBorrow !== null}
        onClose={closeBorrowDialog}
        aria-labelledby="borrow-library-item-title"
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              padding: "8px",
              maxWidth: "440px",
              width: "100%",
            },
          },
        }}
      >
        <DialogTitle id="borrow-library-item-title" sx={{ color: "#6d28d9" }}>
          {t("library.borrowDialogTitle")}
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t("library.borrowDialogDescription", {
              title: itemToBorrow?.title ?? "",
              name: user?.name ?? "",
            })}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ padding: "16px 24px" }}>
          <MuiButton
            onClick={closeBorrowDialog}
            variant="outlined"
            sx={{
              borderColor: "#6d28d9",
              color: "#6d28d9",
              "&:hover": {
                borderColor: "#5b21b6",
                backgroundColor: "#f5f3ff",
              },
            }}
          >
            {t("library.cancel")}
          </MuiButton>

          <MuiButton
            onClick={() => void confirmBorrow()}
            variant="contained"
            sx={{
              backgroundColor: "#6d28d9",
              "&:hover": {
                backgroundColor: "#5b21b6",
              },
            }}
          >
            {t("library.confirmBorrow")}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        aria-labelledby="delete-library-item-title"
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              padding: "8px",
              maxWidth: "440px",
              width: "100%",
            },
          },
        }}
      >
        <DialogTitle
          id="delete-library-item-title"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "#b91c1c",
          }}
        >
          <AlertTriangle size={24} />
          {t("library.deleteDialogTitle")}
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t("library.deleteDialogDescription", {
              title: itemToDelete?.title ?? "",
            })}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ padding: "16px 24px" }}>
          <MuiButton
            onClick={() => setItemToDelete(null)}
            variant="outlined"
            sx={{
              borderColor: "#6d28d9",
              color: "#6d28d9",
              "&:hover": {
                borderColor: "#5b21b6",
                backgroundColor: "#f5f3ff",
              },
            }}
          >
            {t("library.cancel")}
          </MuiButton>

          <MuiButton
            onClick={handleDelete}
            variant="contained"
            startIcon={<Trash2 size={18} />}
            sx={{
              backgroundColor: "#dc2626",
              "&:hover": {
                backgroundColor: "#b91c1c",
              },
            }}
          >
            {t("library.delete")}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={itemToReturn !== null}
        onClose={() => setItemToReturn(null)}
        aria-labelledby="return-library-item-title"
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              padding: "8px",
              maxWidth: "440px",
              width: "100%",
            },
          },
        }}
      >
        <DialogTitle id="return-library-item-title" sx={{ color: "#6d28d9" }}>
          {t("library.returnDialogTitle")}
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t("library.returnDialogDescription", {
              title: itemToReturn?.title ?? "",
            })}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ padding: "16px 24px" }}>
          <MuiButton
            onClick={() => setItemToReturn(null)}
            variant="outlined"
            sx={{
              borderColor: "#6d28d9",
              color: "#6d28d9",
              "&:hover": {
                borderColor: "#5b21b6",
                backgroundColor: "#f5f3ff",
              },
            }}
          >
            {t("library.cancel")}
          </MuiButton>

          <MuiButton
            onClick={() => void confirmReturn()}
            variant="contained"
            sx={{
              backgroundColor: "#6d28d9",
              "&:hover": {
                backgroundColor: "#5b21b6",
              },
            }}
          >
            {t("library.confirmReturn")}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <BookDetailsModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}

export default LibraryItemList;
