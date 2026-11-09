import { useTranslation } from "react-i18next";
import type { Category, LibraryItemType } from "../types/library";

interface LibraryItemFieldsProps {
  categories: Category[];
  idPrefix: string;
  type: LibraryItemType;
  categoryId: string;
  title: string;
  author: string;
  isbn: string;
  nbrPages: string;
  runTimeMinutes: string;
  isBorrowable: boolean;
  onTypeChange: (type: LibraryItemType) => void;
  onCategoryChange: (categoryId: string) => void;
  onTitleChange: (title: string) => void;
  onAuthorChange: (author: string) => void;
  onIsbnChange: (isbn: string) => void;
  onNbrPagesChange: (nbrPages: string) => void;
  onRunTimeMinutesChange: (runTimeMinutes: string) => void;
  onIsBorrowableChange: (isBorrowable: boolean) => void;
}

function LibraryItemFields({
  categories,
  idPrefix,
  type,
  categoryId,
  title,
  author,
  isbn,
  nbrPages,
  runTimeMinutes,
  isBorrowable,
  onTypeChange,
  onCategoryChange,
  onTitleChange,
  onAuthorChange,
  onIsbnChange,
  onNbrPagesChange,
  onRunTimeMinutesChange,
  onIsBorrowableChange,
}: LibraryItemFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor={`${idPrefix}-type`}>{t("libraryFields.type")}</label>
          <select
            id={`${idPrefix}-type`}
            value={type}
            onChange={(event) =>
              onTypeChange(event.target.value as LibraryItemType)
            }
          >
            <option value="BOOK">{t("libraryFields.book")}</option>
            <option value="DVD">{t("libraryFields.dvd")}</option>
            <option value="AUDIOBOOK">{t("libraryFields.audiobook")}</option>
            <option value="REFERENCE_BOOK">
              {t("libraryFields.referenceBook")}
            </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor={`${idPrefix}-title`}>
            {t("libraryFields.title")}
          </label>
          <input
            id={`${idPrefix}-title`}
            type="text"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </div>

        {(type === "BOOK" || type === "REFERENCE_BOOK") && (
          <>
            <div className="form-group">
              <label htmlFor={`${idPrefix}-author`}>
                {t("libraryFields.author")}
              </label>
              <input
                id={`${idPrefix}-author`}
                type="text"
                value={author}
                onChange={(event) => onAuthorChange(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor={`${idPrefix}-isbn`}>
                {t("libraryFields.isbn")}
              </label>
              <input
                id={`${idPrefix}-isbn`}
                type="text"
                value={isbn}
                onChange={(event) => onIsbnChange(event.target.value)}
                maxLength={17}
              />
            </div>

            <div className="form-group">
              <label htmlFor={`${idPrefix}-nbrPages`}>
                {t("libraryFields.numberOfPages")}
              </label>
              <input
                id={`${idPrefix}-nbrPages`}
                type="number"
                value={nbrPages}
                onChange={(event) => onNbrPagesChange(event.target.value)}
              />
            </div>
          </>
        )}

        {(type === "DVD" || type === "AUDIOBOOK") && (
          <div className="form-group">
            <label htmlFor={`${idPrefix}-runTimeMinutes`}>
              {t("libraryFields.runtime")}
            </label>
            <input
              id={`${idPrefix}-runTimeMinutes`}
              type="number"
              value={runTimeMinutes}
              onChange={(event) => onRunTimeMinutesChange(event.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor={`${idPrefix}-category`}>
            {t("libraryFields.category")}
          </label>
          <select
            id={`${idPrefix}-category`}
            value={categoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">{t("libraryFields.selectCategory")}</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {type !== "REFERENCE_BOOK" && (
        <label className="checkbox-group" htmlFor={`${idPrefix}-isBorrowable`}>
          <input
            id={`${idPrefix}-isBorrowable`}
            type="checkbox"
            checked={isBorrowable}
            onChange={(event) => onIsBorrowableChange(event.target.checked)}
          />
          <span>{t("libraryFields.borrowable")}</span>
        </label>
      )}

      {type === "REFERENCE_BOOK" && (
        <p className="reference-notice">{t("libraryFields.referenceNotice")}</p>
      )}
    </>
  );
}

export default LibraryItemFields;
