import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button as MuiButton,
  TextField,
} from "@mui/material";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  borrowLibraryItem,
  returnLibraryItem,
  deleteLibraryItem,
} from "../services/LibraryItemService";
import EditLibraryItemForm from "./EditLibraryItemForm";
import type { Category, LibraryItem, LibrarySort } from "../types/library";

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

function getLibraryItemTypeLabel(type: LibraryItem["type"]) {
  switch (type) {
    case "BOOK":
      return "Bok";
    case "DVD":
      return "DVD";
    case "AUDIOBOOK":
      return "Ljudbok";
    case "REFERENCE_BOOK":
      return "Referensbok";
  }
}

function isOverdue(item: LibraryItem) {
  if (!item.borrower || !item.dueDate) {
    return false;
  }

  const dueDate = new Date(item.dueDate);
  const today = new Date();

  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return dueDate < today;
}

function LibraryItemList({
  libraryItems,
  categories,
  sort,
  setSort,
  onLibraryItemUpdated,
}: LibraryItemListProps) {
  const [showAbbreviations, setShowAbbreviations] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemToDelete, setItemToDelete] = useState<LibraryItem | null>(null);
  const [itemToBorrow, setItemToBorrow] = useState<LibraryItem | null>(null);
  const [borrower, setBorrower] = useState("");
  const [borrowError, setBorrowError] = useState("");
  const [itemToReturn, setItemToReturn] = useState<LibraryItem | null>(null);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredItems = libraryItems
    .filter((item) => {
      if (!normalizedSearchTerm) return true;
      return item.title.toLowerCase().includes(normalizedSearchTerm);
    })
    .sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();

      // Sökresultat som börjar med sökordet visas först.
      if (normalizedSearchTerm) {
        const aStartsWithSearch = titleA.startsWith(normalizedSearchTerm);
        const bStartsWithSearch = titleB.startsWith(normalizedSearchTerm);

        if (aStartsWithSearch && !bStartsWithSearch) return -1;
        if (!aStartsWithSearch && bStartsWithSearch) return 1;
      }

      switch (sort) {
        case "title-asc":
          return titleA.localeCompare(titleB, "sv");

        case "title-desc":
          return titleB.localeCompare(titleA, "sv");

        case "category":
          return a.category.name.localeCompare(b.category.name, "sv");

        case "type":
          return getLibraryItemTypeLabel(a.type).localeCompare(
            getLibraryItemTypeLabel(b.type),
            "sv",
          );

        default:
          return 0;
      }
    });

  function handleBorrow(item: LibraryItem) {
    setItemToBorrow(item);
    setBorrower("");
    setBorrowError("");
  }

  function closeBorrowDialog() {
    setItemToBorrow(null);
    setBorrower("");
    setBorrowError("");
  }

  async function confirmBorrow() {
    if (!itemToBorrow) return;

    if (borrower.trim() === "") {
      setBorrowError("Du måste ange låntagarens namn.");
      return;
    }

    try {
      await borrowLibraryItem(itemToBorrow.id, borrower.trim());
      closeBorrowDialog();
      await onLibraryItemUpdated();
      toast.success("Biblioteksposten har lånats ut!");
    } catch (error) {
      console.error("Kunde inte låna library item.", error);
      toast.error("Det gick inte att låna objektet.");
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
      toast.success("Biblioteksposten har returnerats!");
    } catch (error) {
      console.error("Kunde inte returnera library item.", error);
      toast.error("Det gick inte att returnera objektet.");
    }
  }

  async function handleDelete() {
    if (!itemToDelete) return;

    if (itemToDelete.borrower) {
      toast.error(
        "Boken kan inte tas bort eftersom den är utlånad. Registrera återlämningen först.",
      );
      return;
    }

    try {
      await deleteLibraryItem(itemToDelete.id);
      setItemToDelete(null);
      await onLibraryItemUpdated();
      toast.success("Biblioteksposten har tagits bort!");
    } catch (error) {
      console.error("Kunde inte ta bort library item.", error);
      toast.error("Det gick inte att ta bort biblioteksposten.");
    }
  }

  return (
    <div className="library-list">
      <div className="library-toolbar">
        <div className="library-search">
          <label htmlFor="library-search-input">Sök material</label>
          <input
            id="library-search-input"
            type="search"
            placeholder="Sök efter titel eller författare..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="sort-control">
          <label htmlFor="sort">Sortera efter:</label>

          <select
            id="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as LibrarySort)}
          >
            <option value="title-asc">Titel A–Ö</option>
            <option value="title-desc">Titel Ö–A</option>
            <option value="category">Kategori A–Ö</option>
            <option value="type">Typ</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowAbbreviations(!showAbbreviations)}
        >
          {showAbbreviations
            ? "Visa fullständiga titlar"
            : "Visa förkortade titlar"}
        </button>
      </div>

      <p className="library-results-count" aria-live="polite">
        {filteredItems.length}{" "}
        {filteredItems.length === 1 ? "träff" : "träffar"}
      </p>

      <div className="library-items">
        {filteredItems.map((item, index) => (
          <motion.div
            className="library-item"
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: Math.min(index * 0.08, 0.48),
              ease: "easeOut",
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
                  src={
                    item.imageUrl ??
                    {
                      BOOK: "/images/bok.png",
                      DVD: "/images/dvd.png",
                      AUDIOBOOK: "/images/ljudbok.png",
                      REFERENCE_BOOK: "/images/referensbok.png",
                    }[item.type]
                  }
                  alt={`Omslag till ${item.title}`}
                  loading="lazy"
                />

                <h2>
                  {showAbbreviations
                    ? `${item.title} (${getTitleAbbreviation(item.title)})`
                    : item.title}
                </h2>

                <p>Typ: {getLibraryItemTypeLabel(item.type)}</p>
                <p>Kategori: {item.category.name}</p>

                {item.isBorrowable ? (
                  item.borrower ? (
                    <>
                      <p>Utlånad till: {item.borrower}</p>

                      <p>
                        Utlånad datum:{" "}
                        {item.borrowDate
                          ? new Date(item.borrowDate).toLocaleDateString(
                              "sv-SE",
                            )
                          : "-"}
                      </p>

                      <p>
                        Förfallodatum:{" "}
                        {item.dueDate
                          ? new Date(item.dueDate).toLocaleDateString("sv-SE")
                          : "-"}
                      </p>

                      {isOverdue(item) ? (
                        <p className="overdue-label" role="status">
                          Försenad
                        </p>
                      ) : (
                        <p className="borrowed-label" role="status">
                          Utlånad
                        </p>
                      )}

                      <div className="library-item-actions">
                        <button
                          type="button"
                          className="library-action-button"
                          onClick={() => handleReturn(item)}
                        >
                          Returnera
                        </button>

                        <button
                          type="button"
                          className="library-action-button"
                          onClick={() => setEditingItemId(item.id)}
                        >
                          Ändra
                        </button>

                        <button
                          type="button"
                          className="library-action-button"
                          onClick={() => setItemToDelete(item)}
                        >
                          Ta bort
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="available-label" role="status">
                        Ej utlånad
                      </p>

                      <div className="library-item-actions">
                        <button
                          type="button"
                          className="library-action-button"
                          onClick={() => handleBorrow(item)}
                        >
                          Låna
                        </button>

                        <button
                          type="button"
                          className="library-action-button"
                          onClick={() => setEditingItemId(item.id)}
                        >
                          Ändra
                        </button>

                        <button
                          type="button"
                          className="library-action-button"
                          onClick={() => setItemToDelete(item)}
                        >
                          Ta bort
                        </button>
                      </div>
                    </>
                  )
                ) : (
                  <>
                    <p>Referensexemplar – kan inte lånas</p>

                    <div className="library-item-actions">
                      <button
                        type="button"
                        className="library-action-button"
                        onClick={() => setEditingItemId(item.id)}
                      >
                        Ändra
                      </button>

                      <button
                        type="button"
                        className="library-action-button"
                        onClick={() => setItemToDelete(item)}
                      >
                        Ta bort
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className="library-empty-state">
          Inga biblioteksposter matchar din sökning.
        </p>
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
          Låna bibliotekspost
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Ange vem som ska låna <strong>{itemToBorrow?.title}</strong>.
          </DialogContentText>

          <TextField
            autoFocus
            fullWidth
            margin="dense"
            id="borrower-name"
            label="Låntagarens namn"
            value={borrower}
            onChange={(event) => {
              setBorrower(event.target.value);
              setBorrowError("");
            }}
            error={borrowError !== ""}
            helperText={borrowError}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void confirmBorrow();
              }
            }}
          />
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
            Avbryt
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
            Bekräfta lån
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
          Ta bort bibliotekspost
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Är du säker på att du vill ta bort{" "}
            <strong>{itemToDelete?.title}</strong>? Den här åtgärden kan inte
            ångras.
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
            Avbryt
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
            Ta bort
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
          Återlämna bibliotekspost
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Vill du bekräfta att <strong>{itemToReturn?.title}</strong> har
            återlämnats?
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
            Avbryt
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
            Bekräfta återlämning
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default LibraryItemList;
