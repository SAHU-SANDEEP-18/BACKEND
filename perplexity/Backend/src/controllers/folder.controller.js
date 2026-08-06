import folderModel from "../models/folder.model.js";
import chatModel from "../models/chat.model.js";

export async function createFolder(req, res) {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "Folder name required" });

  const folder = await folderModel.create({ name: name.trim(), user: req.user.id });
  res.status(201).json({ folder });
}

export async function getFolders(req, res) {
  const folders = await folderModel.find({ user: req.user.id }).sort({ createdAt: 1 });
  res.status(200).json({ folders });
}

export async function renameFolder(req, res) {
  const { folderId } = req.params;
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "Folder name required" });

  const folder = await folderModel.findOneAndUpdate(
    { _id: folderId, user: req.user.id },
    { name: name.trim() },
    { new: true },
  );
  if (!folder) return res.status(404).json({ message: "Folder not found" });
  res.status(200).json({ folder });
}

export async function deleteFolder(req, res) {
  const { folderId } = req.params;
  const folder = await folderModel.findOneAndDelete({ _id: folderId, user: req.user.id });
  if (!folder) return res.status(404).json({ message: "Folder not found" });

  await chatModel.updateMany({ folderId, user: req.user.id }, { folderId: null });
  res.status(200).json({ message: "Folder deleted" });
}

export async function moveChatToFolder(req, res) {
  const { chatId } = req.params;
  const { folderId } = req.body;

  const chat = await chatModel.findOneAndUpdate(
    { _id: chatId, user: req.user.id },
    { folderId: folderId || null },
    { new: true },
  );
  if (!chat) return res.status(404).json({ message: "Chat not found" });
  res.status(200).json({ chat });
}