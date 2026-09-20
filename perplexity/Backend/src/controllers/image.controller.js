import imageModel from "../models/image.model.js"; // path apne project ke hisaab se confirm karna
import { uploadToImageKit } from "../services/imagekit.service.js"; // apna exact filename confirm kar lena (imagekit.js ya kuch aur)

// ── Pollinations-URL se image fetch karके ImageKit + DB dono mein save karo ──
export async function saveGeneratedImage(req, res) {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    return res.status(400).json({ message: "Both imageUrl and prompt are required" });
  }

  try {
    // Step 1: Fetch actual image bytes from Pollinations URL
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Image fetch failed");
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 2: Upload to ImageKit for permanent CDN storage
    const fileName = `ai-${Date.now()}.png`;
    const result = await uploadToImageKit(buffer, fileName, "ai-generated");

    // Step 3: Save to Database
    const savedImage = await imageModel.create({
      user: req.user.id,
      prompt,
      url: result.url,
      fileId: result.fileId,
    });

    res.status(200).json({ image: savedImage });
  } catch (err) {
    console.error("Save-generated-image error:", err);
    res.status(500).json({ message: "Failed to save generated image" });
  }
}

// ── List user's saved images ──
export async function getMyImages(req, res) {
  try {
    const images = await imageModel.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ images });
  } catch (err) {
    res.status(500).json({ message: "Failed to load saved images" });
  }
}

// ── Image delete karo ──
export async function deleteImage(req, res) {
  const { imageId } = req.params;

  try {
    const image = await imageModel.findOneAndDelete({ _id: imageId, user: req.user.id });
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
}