import { useState } from "react";
import { toast } from "react-toastify";
import { updateLibraryItem } from "../services/LibraryItemService";
import type { Category, LibraryItem, LibraryItemType } from "../types/library";
import { libraryItemSchema } from "../schemas/libraryItemSchema";
import { buildLibraryItemFormData } from "../utils/libraryItemFormUtils";
import LibraryItemFields from "./LibraryItemFields";
import { uploadLibraryItemImage } from "../services/ImageUploadService";

interface EditLibraryItemFormProps {
  item: LibraryItem;
  categories: Category[];
  onLibraryItemUpdated: () => Promise<void>;
  onCancel: () => void;
}

function EditLibraryItemForm({
  item,
  categories,
  onLibraryItemUpdated,
  onCancel,
}: EditLibraryItemFormProps) {
  const [type, setType] = useState<LibraryItemType>(item.type);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [title, setTitle] = useState(item.title);
  const [author, setAuthor] = useState(item.author ?? "");
  const [nbrPages, setNbrPages] = useState(item.nbrPages?.toString() ?? "");
  const [runTimeMinutes, setRunTimeMinutes] = useState(
    item.runTimeMinutes?.toString() ?? "",
  );
  const [isBorrowable, setIsBorrowable] = useState(item.isBorrowable);
  const [imageFile, setImageFile] = useState<File | null>(null);

  function handleImageChange(file: File | null) {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Välj en JPG-, PNG- eller WebP-bild.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Bilden får vara högst 5 MB.");
      return;
    }

    setImageFile(file);
  }

  function handleTypeChange(newType: LibraryItemType) {
    setType(newType);
    setAuthor("");
    setNbrPages("");
    setRunTimeMinutes("");
    setIsBorrowable(newType !== "REFERENCE_BOOK");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = buildLibraryItemFormData({
      title,
      categoryId,
      isBorrowable,
      type,
      author,
      nbrPages,
      runTimeMinutes,
    });

    const result = libraryItemSchema.safeParse(data);

    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        imageUrl = await uploadLibraryItemImage(imageFile);
      }

      await updateLibraryItem(item.id, {
        ...result.data,
        ...(imageUrl ? { imageUrl } : {}),
      });

      await onLibraryItemUpdated();
      toast.success("Biblioteksposten har uppdaterats!");
      onCancel();
    } catch (error) {
      console.error("Kunde inte uppdatera library item.", error);
      toast.error("Kunde inte uppdatera biblioteksposten.");
    }
  }

  return (
    <form className="edit-library-item-form" onSubmit={handleSubmit}>
      <div className="edit-form-header">
        <div>
          <p className="eyebrow">REDIGERA</p>
          <h3>Redigera bibliotekspost</h3>
        </div>
      </div>

      <div className="edit-form-image">
        <label htmlFor={`edit-image-${item.id}`}>Omslagsbild</label>

        <img
          className="library-item-image"
          src={
            imageFile
              ? URL.createObjectURL(imageFile)
              : (item.imageUrl ??
                {
                  BOOK: "/images/bok.png",
                  DVD: "/images/dvd.png",
                  AUDIOBOOK: "/images/ljudbok.png",
                  REFERENCE_BOOK: "/images/referensbok.png",
                }[item.type])
          }
          alt={`Omslag till ${item.title}`}
        />

        <input
          id={`edit-image-${item.id}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            handleImageChange(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />
      </div>

      <LibraryItemFields
        idPrefix={`edit-${item.id}`}
        categories={categories}
        type={type}
        categoryId={categoryId}
        title={title}
        author={author}
        nbrPages={nbrPages}
        runTimeMinutes={runTimeMinutes}
        isBorrowable={isBorrowable}
        onTypeChange={handleTypeChange}
        onCategoryChange={setCategoryId}
        onTitleChange={setTitle}
        onAuthorChange={setAuthor}
        onNbrPagesChange={setNbrPages}
        onRunTimeMinutesChange={setRunTimeMinutes}
        onIsBorrowableChange={setIsBorrowable}
      />

      <div className="edit-form-actions">
        <button className="primary-button" type="submit">
          Spara ändringar
        </button>

        <button className="secondary-button" type="button" onClick={onCancel}>
          Avbryt
        </button>
      </div>
    </form>
  );
}

export default EditLibraryItemForm;
