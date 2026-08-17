import { Router } from "express";
import { saveGeneratedImage, getMyImages, deleteImage } from "../controllers/image.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";
const imageRouter = Router();
imageRouter.post("/save-generated", authUser, saveGeneratedImage);
imageRouter.get("/my-images", authUser, getMyImages);
imageRouter.delete("/:imageId", authUser, deleteImage);

export default imageRouter;