import api from "./axios";
import API_BASE_URL from "../api";

const UPLOAD_URL = `${API_BASE_URL}/upload`;

interface ImageUploadResponse {
  imageUrl: string;
}

export async function uploadLibraryItemImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("imageType", "book");
  formData.append("image", file);

  const response = await api.post<ImageUploadResponse>(UPLOAD_URL, formData);

  return response.data.imageUrl;
}

export async function uploadAvatarImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("imageType", "avatar");
  formData.append("image", file);

  const response = await api.post<ImageUploadResponse>(UPLOAD_URL, formData);

  return response.data.imageUrl;
}
