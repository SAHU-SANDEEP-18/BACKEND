import axios from "axios";
import { apiUrl } from "../../../config/api";

const api = axios.create({
  baseURL: apiUrl("/api/auth"),
  withCredentials: true,
});

export async function register({ username, email, password }) {
  const response = await api.post("/register", { username, email, password });
  return response.data;
}

export async function login({ email, password }) {
  const response = await api.post("/login", { email, password });
  return response.data;
}

export async function getMe() {
  const response = await api.get("/get-me");
  return response.data;
}

export const updateCustomInstructions = async (customInstructions) => {
  const response = await api.put("/custom-instructions", { customInstructions });
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/logout");
  return response.data;
};