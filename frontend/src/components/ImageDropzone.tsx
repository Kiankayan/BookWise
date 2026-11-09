import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { CloudUpload } from "lucide-react";

interface ImageDropzoneProps {
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
}

function ImageDropzone({ imageFile, onImageChange }: ImageDropzoneProps) {
  const { t } = useTranslation();

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
      toast.error(t("imageDropzone.invalidFormat"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("imageDropzone.tooLarge"));
      return;
    }

    onImageChange(file);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleImageChange(event.dataTransfer.files[0] ?? null);
  }

  return (
    <>
      <label htmlFor="library-item-image">{t("imageDropzone.label")}</label>

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
              alt={t("imageDropzone.previewAlt")}
            />

            <span>{imageFile?.name}</span>

            <button
              type="button"
              className="image-remove-button"
              onClick={(event) => {
                event.stopPropagation();
                onImageChange(null);

                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              {t("imageDropzone.removeImage")}
            </button>
          </div>
        ) : (
          <div className="image-dropzone-content">
            <span className="image-upload-icon">
              <CloudUpload size={32} strokeWidth={1.8} />
            </span>
            <strong>{t("imageDropzone.dragAndDrop")}</strong>
            <span>{t("imageDropzone.orChoose")}</span>
            <small>{t("imageDropzone.imageFormats")}</small>
          </div>
        )}
      </div>
    </>
  );
}

export default ImageDropzone;
