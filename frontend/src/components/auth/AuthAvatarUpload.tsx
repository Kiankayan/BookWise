import { useEffect, useRef, useState } from "react";
import { ImagePlus, UserRound, X } from "lucide-react";
import { useTranslation } from "react-i18next";

type AuthAvatarUploadProps = {
  onAvatarChange: (file: File | null) => void;
  onError: (message: string) => void;
};

function AuthAvatarUpload({ onAvatarChange, onError }: AuthAvatarUploadProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (!avatarPreview) {
      return;
    }

    return () => {
      URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      onError(t("register.invalidImageFormat"));
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError(t("register.imageTooLarge"));
      event.target.value = "";
      return;
    }

    onError("");
    setAvatarPreview(URL.createObjectURL(file));
    onAvatarChange(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview("");
    onAvatarChange(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="auth-form-group">
      <label>{t("register.profilePicture")}</label>

      <div className="auth-avatar-upload">
        {avatarPreview ? (
          <div className="auth-avatar-preview">
            <img src={avatarPreview} alt={t("register.previewAlt")} />

            <button
              type="button"
              onClick={handleRemoveAvatar}
              aria-label={t("register.removePicture")}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="auth-avatar-placeholder">
            <UserRound size={28} />
          </div>
        )}

        <div className="auth-avatar-actions">
          <button
            type="button"
            className="auth-avatar-select-button"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus size={16} />
            {t("register.chooseImage")}
          </button>

          <span>{t("register.imageFormats")}</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarChange}
          hidden
        />
      </div>
    </div>
  );
}

export default AuthAvatarUpload;
