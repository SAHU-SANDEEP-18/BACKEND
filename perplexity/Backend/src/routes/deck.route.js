import express from "express";
import { authUser } from "../middlewares/auth.middleware.js"; // apna exact path confirm karna
import { generateOutlineController, createDeck, getMyDecks, getDeckById, updateDeck, deleteDeck } from "../controllers/deck.controller.js";

const deckRouter = express.Router();

deckRouter.post("/generate", authUser, generateOutlineController);
deckRouter.post("/", authUser, createDeck);
deckRouter.get("/", authUser, getMyDecks);
deckRouter.get("/:deckId", authUser, getDeckById);
deckRouter.patch("/:deckId", authUser, updateDeck);
deckRouter.delete("/:deckId", authUser, deleteDeck);

export default deckRouter;