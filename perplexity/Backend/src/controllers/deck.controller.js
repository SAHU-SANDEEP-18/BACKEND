import deckModel from "../models/deck.model.js";
import { generateDeckOutlineWithMistral } from "../services/ai.service.js";

export async function generateOutlineController(req, res) {
  const { topic, slideCount } = req.body;
  if (!topic || !topic.trim()) {
    return res.status(400).json({ message: "Topic is required" });
  }

  try {
    const outline = await generateDeckOutlineWithMistral(topic.trim(), slideCount || 5);
    res.status(200).json(outline);
  } catch (err) {
    console.error("Generate outline controller error:", err);
    res.status(500).json({ message: err.message || "Failed to generate presentation outline with Mistral AI" });
  }
}

export async function createDeck(req, res) {
  const { title, prompt, slides } = req.body;
  try {
    const deck = await deckModel.create({ user: req.user.id, title, prompt, slides });
    res.status(200).json({ deck });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create presentation deck" });
  }
}


export async function getMyDecks(req, res) {
  try {
    const decks = await deckModel
      .find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .select("title prompt updatedAt slides");
    res.status(200).json({ decks });
  } catch (err) {
    res.status(500).json({ message: "Failed to load presentations" });
  }
}

export async function getDeckById(req, res) {
  const { deckId } = req.params;
  try {
    const deck = await deckModel.findOne({ _id: deckId, user: req.user.id });
    if (!deck) return res.status(404).json({ message: "Presentation deck not found" });
    res.status(200).json({ deck });
  } catch (err) {
    res.status(500).json({ message: "Failed to load presentation deck" });
  }
}

export async function updateDeck(req, res) {
  const { deckId } = req.params;
  const { title, slides } = req.body;
  try {
    const deck = await deckModel.findOneAndUpdate(
      { _id: deckId, user: req.user.id },
      { ...(title !== undefined && { title }), ...(slides !== undefined && { slides }) },
      { new: true },
    );
    if (!deck) return res.status(404).json({ message: "Presentation deck not found" });
    res.status(200).json({ deck });
  } catch (err) {
    res.status(500).json({ message: "Failed to update presentation deck" });
  }
}

export async function deleteDeck(req, res) {
  const { deckId } = req.params;
  try {
    const deck = await deckModel.findOneAndDelete({ _id: deckId, user: req.user.id });
    if (!deck) return res.status(404).json({ message: "Deck not found" });
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
}