import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/decks",
  withCredentials: true,
});

export const createDeck = async (title, prompt, slides) => {
  const response = await api.post("", { title, prompt, slides });
  return response.data;
};

export const getMyDecks = async () => {
  const response = await api.get("");
  return response.data;
};

export const getDeckById = async (deckId) => {
  const response = await api.get(`/${deckId}`);
  return response.data;
};

export const updateDeck = async (deckId, updates) => {
  const response = await api.patch(`/${deckId}`, updates);
  return response.data;
};

export const deleteDeck = async (deckId) => {
  const response = await api.delete(`/${deckId}`);
  return response.data;
};

// ── AI-outline generation — Mistral AI via Backend ──
export const generateOutline = async (topic, slideCount = 5) => {
  try {
    const response = await api.post("/generate", { topic, slideCount });
    return response.data;
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || "Failed to generate presentation outline from Nexus AI";
    console.error("Nexus AI outline error:", err);
    throw new Error(errorMsg);
  }
};