import axios from "axios";
import API_BASE_URL from "../api";

const UPLOAD_URL = `${API_BASE_URL}/upload`;

interface ImageUploadResponse {
  imageUrl: string;
}

export async function uploadLibraryItemImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post<ImageUploadResponse>(UPLOAD_URL, formData);

  return response.data.imageUrl;
}
