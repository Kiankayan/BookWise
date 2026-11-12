import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import EditLibraryItemForm from "./EditLibraryItemForm";
import type { Category, LibraryItem } from "../types/library";
import { getLibraryItemImage } from "../utils/libraryItemImage";
import {
  getTitleAbbreviation,
  getTypeLabel,
  isOverdue,
} from "../utils/libraryItemHelpers";

interface LibraryItemCardProps {
  item: LibraryItem;
  index: number;
  categories: Category[];
  isAdmin: boolean;
  userId?: string;
  dateLocale: string;
  showAbbreviations: boolean;
  editingItemId: string | null;
  onEdit: (item: LibraryItem) => void;
  onCancelEdit: () => void;
  onBorrow: (item: LibraryItem) => void;
  onReturn: (item: LibraryItem) => void;
  onDelete: (item: LibraryItem) => void;
  onSelect: (item: LibraryItem) => void;
  onLibraryItemUpdated: () => Promise<void>;
}

function LibraryItemCard({
  item,
  index,
  categories,
  isAdmin,
  userId,
  dateLocale,
  showAbbreviations,
  editingItemId,
  onEdit,
  onCancelEdit,
  onBorrow,
  onReturn,
  onDelete,
  onSelect,
  onLibraryItemUpdated,
}: LibraryItemCardProps) {
  const { t } = useTranslation();
  const activeLoan = item.loans[0];

  const typeLabel = getTypeLabel(item.type, (key) => t(key));

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
          onSelect(item);
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
          onSelect(item);
        }
      }}
    >
      {editingItemId === item.id ? (
        <EditLibraryItemForm
          item={item}
          categories={categories}
          onLibraryItemUpdated={onLibraryItemUpdated}
          onCancel={onCancelEdit}
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
            {t("library.typeLabel")} {typeLabel}
          </p>
          <p>
            {t("library.categoryLabel")} {item.category.name}
          </p>

          {item.isBorrowable ? (
            activeLoan ? (
              <>
                <p>
                  {t("library.borrowedTo")} {activeLoan.borrowerName ?? "-"}
                </p>

                <p>
                  {t("library.borrowDate")}{" "}
                  {activeLoan.borrowDate
                    ? new Date(activeLoan.borrowDate).toLocaleDateString(
                        dateLocale,
                      )
                    : "-"}
                </p>

                <p>
                  {t("library.dueDate")}{" "}
                  {activeLoan.dueDate
                    ? new Date(activeLoan.dueDate).toLocaleDateString(
                        dateLocale,
                      )
                    : "-"}
                </p>

                {isOverdue(activeLoan.dueDate ?? null) ? (
                  <p className="overdue-label" role="status">
                    {t("library.overdue")}
                  </p>
                ) : (
                  <p className="borrowed-label" role="status">
                    {t("library.borrowedStatus")}
                  </p>
                )}

                <div className="library-item-actions">
                  {(isAdmin || activeLoan.userId === userId) && (
                    <button
                      type="button"
                      className="library-action-button"
                      onClick={() => onReturn(item)}
                    >
                      {t("library.return")}
                    </button>
                  )}

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        className="library-action-button"
                        onClick={() => onEdit(item)}
                      >
                        {t("library.edit")}
                      </button>

                      <button
                        type="button"
                        className="library-action-button"
                        onClick={() => onDelete(item)}
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
                    onClick={() => onBorrow(item)}
                  >
                    {t("library.borrow")}
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        className="library-action-button"
                        onClick={() => onEdit(item)}
                      >
                        {t("library.edit")}
                      </button>

                      <button
                        type="button"
                        className="library-action-button"
                        onClick={() => onDelete(item)}
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
                    onClick={() => onEdit(item)}
                  >
                    {t("library.edit")}
                  </button>

                  <button
                    type="button"
                    className="library-action-button"
                    onClick={() => onDelete(item)}
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
}

export default LibraryItemCard;
