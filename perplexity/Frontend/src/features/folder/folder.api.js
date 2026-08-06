import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/folders",
  withCredentials: true,
});

export const createFolder = async (name) => (await api.post("/", { name })).data;
export const getFolders = async () => (await api.get("/")).data;
export const renameFolder = async (folderId, name) => (await api.put(`/${folderId}`, { name })).data;
export const deleteFolder = async (folderId) => (await api.delete(`/${folderId}`)).data;
export const moveChatToFolder = async (chatId, folderId) =>
  (await api.put(`/move/${chatId}`, { folderId })).data;