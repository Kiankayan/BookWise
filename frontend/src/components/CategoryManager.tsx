import { useState } from "react";
import { motion } from "motion/react";
import { Folder } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../services/CategoryService";
import type { Category } from "../types/library";
import DeleteCategoryDialog from "./DeleteCategoryDialog";

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesChanged: () => Promise<void>;
}

function CategoryManager({
  categories,
  onCategoriesChanged,
}: CategoryManagerProps) {
  const { t } = useTranslation();

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
      toast.error(t("categoryManager.categoryNameRequired"));
      return;
    }

    try {
      await createCategory(name);
      setNewCategoryName("");
      await onCategoriesChanged();
      toast.success(t("categoryManager.created"));
    } catch (error) {
      console.error("Could not create category.", error);
      toast.error(t("categoryManager.duplicateName"));
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
      toast.error(t("categoryManager.categoryNameRequired"));
      return;
    }

    try {
      await updateCategory(editingCategoryId, name);
      cancelEditing();
      await onCategoriesChanged();
      toast.success(t("categoryManager.updated"));
    } catch (error) {
      console.error("Could not update category.", error);
      toast.error(t("categoryManager.duplicateName"));
    }
  }

  async function confirmDeleteCategory() {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      await onCategoriesChanged();
      toast.success(t("categoryManager.deleted"));
    } catch (error) {
      console.error("Could not delete category.", error);
      setCategoryToDelete(null);
      toast.error(t("categoryManager.deleteError"));
    }
  }

  return (
    <section className="category-manager">
      <div className="category-create">
        <input
          type="text"
          value={newCategoryName}
          placeholder={t("categoryManager.newCategory")}
          onChange={(event) => setNewCategoryName(event.target.value)}
        />

        <button type="button" onClick={handleCreateCategory}>
          {t("categoryManager.create")}
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
                    {t("categoryManager.save")}
                  </button>

                  <button type="button" onClick={cancelEditing}>
                    {t("categoryManager.cancel")}
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
                    {t("categoryManager.edit")}
                  </button>

                  <button
                    type="button"
                    className="category-delete-button"
                    onClick={() => setCategoryToDelete(category)}
                  >
                    {t("categoryManager.delete")}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      <DeleteCategoryDialog
        category={categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDeleteCategory}
      />
    </section>
  );
}

export default CategoryManager;
