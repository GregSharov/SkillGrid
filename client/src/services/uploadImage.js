// src/services/uploadImage.js
import { useState } from "react";
import API_URL from "./apiBase";

export default function useUploadImage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (userId, file) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("image", file);

      const response = await fetch(`${API_URL}/user/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      throw err; // Re-throw so the calling function knows there was an error
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, loading, error };
}
