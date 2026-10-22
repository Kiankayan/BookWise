import axios from "axios";

const UPLOAD_URL = "http://localhost:5001/api/upload";

interface ImageUploadResponse {
  imageUrl: string;
}

export async function uploadLibraryItemImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post<ImageUploadResponse>(UPLOAD_URL, formData);

  return response.data.imageUrl;
}
