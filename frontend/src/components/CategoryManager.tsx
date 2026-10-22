import { useState } from "react";
import { motion } from "motion/react";
import { Folder, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button as MuiButton,
} from "@mui/material";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../services/CategoryService";
import type { Category } from "../types/library";

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesChanged: () => Promise<void>;
}

function CategoryManager({
  categories,
  onCategoriesChanged,
}: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  async function handleCreateCategory() {
    const name = newCategoryName.trim();

    if (!name) {
      toast.error("Kategorinamn krävs.");
      return;
    }

    try {
      await createCategory(name);
      setNewCategoryName("");
      await onCategoriesChanged();
      toast.success("Kategorin har skapats!");
    } catch (error) {
      console.error("Kunde inte skapa kategori.", error);
      toast.error("Det finns redan en kategori med samma namn.");
    }
  }

  function startEditing(category: Category) {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  }

  function cancelEditing() {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  }

  async function handleUpdateCategory() {
    if (!editingCategoryId) return;

    const name = editingCategoryName.trim();

    if (!name) {
      toast.error("Kategorinamn krävs.");
      return;
    }

    try {
      await updateCategory(editingCategoryId, name);
      cancelEditing();
      await onCategoriesChanged();
      toast.success("Kategorin har uppdaterats!");
    } catch (error) {
      console.error("Kunde inte uppdatera kategori.", error);
      toast.error("Det finns redan en kategori med samma namn.");
    }
  }

  async function confirmDeleteCategory() {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      await onCategoriesChanged();
      toast.success("Kategorin har tagits bort!");
    } catch (error) {
      console.error("Kunde inte ta bort kategori.", error);
      setCategoryToDelete(null);
      toast.error(
        "Kategorin kunde inte tas bort. Kontrollera att den inte används av någon bibliotekspost.",
      );
    }
  }

  return (
    <section className="category-manager">
      <div className="category-create">
        <input
          type="text"
          value={newCategoryName}
          placeholder="Ny kategori"
          onChange={(event) => setNewCategoryName(event.target.value)}
        />

        <button type="button" onClick={handleCreateCategory}>
          Skapa kategori
        </button>
      </div>

      <div className="category-list">
        {categories.map((category, index) => (
          <motion.div
            className="category-row"
            key={category.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: Math.min(index * 0.08, 0.48),
              ease: "easeOut",
            }}
          >
            {editingCategoryId === category.id ? (
              <div className="category-edit">
                <input
                  type="text"
                  value={editingCategoryName}
                  onChange={(event) =>
                    setEditingCategoryName(event.target.value)
                  }
                />

                <div className="category-actions">
                  <button type="button" onClick={handleUpdateCategory}>
                    Spara
                  </button>

                  <button type="button" onClick={cancelEditing}>
                    Avbryt
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="category-title">
                  <Folder size={20} />
                  <span className="category-name">{category.name}</span>
                </div>

                <div className="category-actions">
                  <button
                    type="button"
                    className="category-edit-button"
                    onClick={() => startEditing(category)}
                  >
                    Ändra
                  </button>

                  <button
                    type="button"
                    className="category-delete-button"
                    onClick={() => setCategoryToDelete(category)}
                  >
                    Ta bort
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      <Dialog
        open={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        aria-labelledby="delete-category-title"
        aria-describedby="delete-category-description"
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: "20px",
              padding: "8px",
              boxShadow: "0 20px 60px rgba(55, 35, 91, 0.18)",
            },
          },
        }}
      >
        <DialogTitle
          id="delete-category-title"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            color: "#302642",
            fontWeight: 750,
            fontSize: "20px",
          }}
        >
          <AlertTriangle size={23} color="#7c3aed" />
          Ta bort kategori?
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            id="delete-category-description"
            sx={{ color: "#807990", lineHeight: 1.8 }}
          >
            Vill du verkligen ta bort kategorin{" "}
            <strong>{categoryToDelete?.name}</strong>? Åtgärden kan inte ångras.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ padding: "16px", gap: 1 }}>
          <MuiButton
            onClick={() => setCategoryToDelete(null)}
            variant="outlined"
            sx={{
              color: "#6d28d9",
              backgroundColor: "#ffffff",
              border: "1px solid #d8ccff",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              padding: "9px 16px",
              boxShadow: "none",
              "&:hover": {
                color: "#6d28d9",
                backgroundColor: "#eee5ff",
                border: "1px solid #7c3aed",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.15)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Avbryt
          </MuiButton>

          <MuiButton
            onClick={confirmDeleteCategory}
            variant="contained"
            startIcon={<Trash2 size={17} />}
            sx={{
              backgroundColor: "#7c3aed",
              "&:hover": { backgroundColor: "#6d28d9" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              padding: "9px 16px",
              boxShadow: "none",
            }}
          >
            Ta bort
          </MuiButton>
        </DialogActions>
      </Dialog>
    </section>
  );
}

export default CategoryManager;
