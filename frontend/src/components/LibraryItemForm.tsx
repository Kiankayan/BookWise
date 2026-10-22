import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createLibraryItem } from "../services/LibraryItemService";
import type { Category, LibraryItemType } from "../types/library";
import { libraryItemSchema } from "../schemas/libraryItemSchema";
import { buildLibraryItemFormData } from "../utils/libraryItemFormUtils";
import LibraryItemFields from "./LibraryItemFields";
import { uploadLibraryItemImage } from "../services/ImageUploadService";
import { CloudUpload } from "lucide-react";
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

  const [type, setType] = useState<LibraryItemType>("BOOK");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [nbrPages, setNbrPages] = useState("");
  const [runTimeMinutes, setRunTimeMinutes] = useState("");
  const [isBorrowable, setIsBorrowable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

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

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    handleImageChange(file ?? null);
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

      await createLibraryItem({
        ...result.data,
        ...(imageUrl ? { imageUrl } : {}),
      });

      setTitle("");
      setAuthor("");
      setNbrPages("");
      setRunTimeMinutes("");
      setCategoryId("");
      setType("BOOK");
      setIsBorrowable(true);
      setImageFile(null);

      await onLibraryItemCreated();
      toast.success("Biblioteksposten har skapats!");
    } catch (error) {
      console.error("Kunde inte skapa library item.", error);

      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        if (typeof message === "string") {
          toast.error(message);
          return;
        }
      }

      toast.error("Kunde inte skapa biblioteksposten. Försök igen.");
    }
  }

  return (
    <form className="library-item-form" onSubmit={handleSubmit}>
      <label htmlFor="library-item-image">Omslagsbild (valfritt)</label>

      <div
        className={`image-dropzone${isDragging ? " image-dropzone-active" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          id="library-item-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(event) => {
            handleImageChange(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />

        {imagePreview ? (
          <div className="image-preview-container">
            <img
              className="image-preview"
              src={imagePreview}
              alt="Förhandsvisning av omslagsbild"
            />

            <span>{imageFile?.name}</span>

            <button
              type="button"
              className="image-remove-button"
              onClick={(event) => {
                event.stopPropagation();
                setImageFile(null);

                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              Ta bort bild
            </button>
          </div>
        ) : (
          <div className="image-dropzone-content">
            <span className="image-upload-icon">
              <CloudUpload size={32} strokeWidth={1.8} />
            </span>
            <strong>Dra och släpp en bild här</strong>
            <span>eller klicka för att välja från datorn</span>
            <small>JPG, PNG eller WebP · Max 5 MB</small>
          </div>
        )}
      </div>

      <LibraryItemFields
        idPrefix="create"
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

      <div className="form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate("/library")}
        >
          Avbryt
        </button>

        <button className="primary-button" type="submit">
          Skapa bibliotekspost
        </button>
      </div>
    </form>
  );
}

export default LibraryItemForm;
