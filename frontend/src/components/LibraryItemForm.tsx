import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { createLibraryItem } from "../services/LibraryItemService";
import type { Category, LibraryItemType } from "../types/library";
import { libraryItemSchema } from "../schemas/libraryItemSchema";
import { buildLibraryItemFormData } from "../utils/libraryItemFormUtils";
import LibraryItemFields from "./LibraryItemFields";
import ImageDropzone from "./ImageDropzone";
import { uploadLibraryItemImage } from "../services/ImageUploadService";
import axios from "axios";

interface LibraryItemFormProps {
  categories: Category[];
  onLibraryItemCreated: () => Promise<void>;
}

function LibraryItemForm({
  categories,
  onLibraryItemCreated,
}: LibraryItemFormProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [type, setType] = useState<LibraryItemType>("BOOK");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [nbrPages, setNbrPages] = useState("");
  const [runTimeMinutes, setRunTimeMinutes] = useState("");
  const [isBorrowable, setIsBorrowable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  function handleTypeChange(newType: LibraryItemType) {
    setType(newType);
    setAuthor("");
    setIsbn("");
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
      isbn,
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

      await createLibraryItem({
        ...result.data,
        ...(imageUrl ? { imageUrl } : {}),
      });

      setTitle("");
      setAuthor("");
      setIsbn("");
      setNbrPages("");
      setRunTimeMinutes("");
      setCategoryId("");
      setType("BOOK");
      setIsBorrowable(true);
      setImageFile(null);

      await onLibraryItemCreated();
      toast.success(t("libraryForm.created"));
    } catch (error) {
      console.error("Kunde inte skapa library item.", error);

      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        if (typeof message === "string") {
          toast.error(message);
          return;
        }
      }

      toast.error(t("libraryForm.createError"));
    }
  }

  return (
    <form className="library-item-form" onSubmit={handleSubmit}>
      <ImageDropzone imageFile={imageFile} onImageChange={setImageFile} />

      <LibraryItemFields
        idPrefix="create"
        categories={categories}
        type={type}
        categoryId={categoryId}
        title={title}
        author={author}
        isbn={isbn}
        nbrPages={nbrPages}
        runTimeMinutes={runTimeMinutes}
        isBorrowable={isBorrowable}
        onTypeChange={handleTypeChange}
        onCategoryChange={setCategoryId}
        onTitleChange={setTitle}
        onAuthorChange={setAuthor}
        onIsbnChange={setIsbn}
        onNbrPagesChange={setNbrPages}
        onRunTimeMinutesChange={setRunTimeMinutes}
        onIsBorrowableChange={setIsBorrowable}
      />

      <div className="form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/library")}
        >
          {t("libraryForm.cancel")}
        </button>

        <button className="primary-button" type="submit">
          {t("libraryForm.create")}
        </button>
      </div>
    </form>
  );
}

export default LibraryItemForm;
