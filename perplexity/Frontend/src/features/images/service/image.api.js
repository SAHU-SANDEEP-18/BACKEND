import axios from "axios";
import { apiUrl } from "../../../config/api";

const api = axios.create({
  baseURL: apiUrl("/api/images"),
  withCredentials: true,
});

export const saveGeneratedImage = async (imageUrl, prompt) => {
  const response = await api.post("/save-generated", { imageUrl, prompt });
  return response.data; // { image }
};

export const getMyImages = async () => {
  const response = await api.get("/my-images");
  return response.data; // { images }
};

export const deleteImage = async (imageId) => {
  const response = await api.delete(`/${imageId}`);
  return response.data;
};