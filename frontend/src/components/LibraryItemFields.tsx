import type { Category, LibraryItemType } from "../types/library";

interface LibraryItemFieldsProps {
  categories: Category[];
  idPrefix: string;
  type: LibraryItemType;
  categoryId: string;
  title: string;
  author: string;
  nbrPages: string;
  runTimeMinutes: string;
  isBorrowable: boolean;
  onTypeChange: (type: LibraryItemType) => void;
  onCategoryChange: (categoryId: string) => void;
  onTitleChange: (title: string) => void;
  onAuthorChange: (author: string) => void;
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
  nbrPages,
  runTimeMinutes,
  isBorrowable,
  onTypeChange,
  onCategoryChange,
  onTitleChange,
  onAuthorChange,
  onNbrPagesChange,
  onRunTimeMinutesChange,
  onIsBorrowableChange,
}: LibraryItemFieldsProps) {
  return (
    <>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor={`${idPrefix}-type`}>Typ</label>
          <select
            id={`${idPrefix}-type`}
            value={type}
            onChange={(event) =>
              onTypeChange(event.target.value as LibraryItemType)
            }
          >
            <option value="BOOK">Bok</option>
            <option value="DVD">DVD</option>
            <option value="AUDIOBOOK">Ljudbok</option>
            <option value="REFERENCE_BOOK">Referensbok</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor={`${idPrefix}-title`}>Titel</label>
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
              <label htmlFor={`${idPrefix}-author`}>Författare</label>
              <input
                id={`${idPrefix}-author`}
                type="text"
                value={author}
                onChange={(event) => onAuthorChange(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor={`${idPrefix}-nbrPages`}>Antal sidor</label>
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
              Speltid i minuter
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
          <label htmlFor={`${idPrefix}-category`}>Kategori</label>
          <select
            id={`${idPrefix}-category`}
            value={categoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">Välj kategori</option>

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
          <span>Kan lånas</span>
        </label>
      )}

      {type === "REFERENCE_BOOK" && (
        <p className="reference-notice">Referensböcker kan inte lånas.</p>
      )}
    </>
  );
}

export default LibraryItemFields;
