// src/services/uploadImage.js
import { useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

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

      // const response = await fetch("http://localhost:3000/user/upload", {
      //   method: "POST",
      //   body: formData,
      // });
      const response = await fetch(`${API_BASE}/user/upload`, {
        method: "POST",
        body: formData,
        credentials: "include", // add if you need cookies/session
      });

      if (!response.ok) throw new Error("Failed to upload image");

      return await response.json();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, loading, error };
}
