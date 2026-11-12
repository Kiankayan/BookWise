import { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../services/CategoryService";
import type { Category } from "../types/library";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import CategoryList from "./CategoryList";

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

      <CategoryList
        categories={categories}
        editingCategoryId={editingCategoryId}
        editingCategoryName={editingCategoryName}
        onEditingCategoryNameChange={setEditingCategoryName}
        onStartEditing={startEditing}
        onCancelEditing={cancelEditing}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={setCategoryToDelete}
      />

      <DeleteCategoryDialog
        category={categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDeleteCategory}
      />
    </section>
  );
}

export default CategoryManager;
