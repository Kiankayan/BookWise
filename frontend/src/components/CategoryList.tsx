import { motion } from "motion/react";
import { Folder } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Category } from "../types/library";

interface CategoryListProps {
  categories: Category[];
  editingCategoryId: string | null;
  editingCategoryName: string;
  onEditingCategoryNameChange: (name: string) => void;
  onStartEditing: (category: Category) => void;
  onCancelEditing: () => void;
  onUpdateCategory: () => Promise<void>;
  onDeleteCategory: (category: Category) => void;
}

function CategoryList({
  categories,
  editingCategoryId,
  editingCategoryName,
  onEditingCategoryNameChange,
  onStartEditing,
  onCancelEditing,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryListProps) {
  const { t } = useTranslation();

  return (
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
                  onEditingCategoryNameChange(event.target.value)
                }
              />

              <div className="category-actions">
                <button type="button" onClick={onUpdateCategory}>
                  {t("categoryManager.save")}
                </button>

                <button type="button" onClick={onCancelEditing}>
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
                  onClick={() => onStartEditing(category)}
                >
                  {t("categoryManager.edit")}
                </button>

                <button
                  type="button"
                  className="category-delete-button"
                  onClick={() => onDeleteCategory(category)}
                >
                  {t("categoryManager.delete")}
                </button>
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default CategoryList;
