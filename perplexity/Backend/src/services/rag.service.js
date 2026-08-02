import { Pinecone } from "@pinecone-database/pinecone";
import { CohereClient } from "cohere-ai";
import { PDFParse } from "pdf-parse";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "langchain";

// Chhota alag Gemini-vision instance — sirf image-based PDFs (jinme text-layer nahi hota, jaise design/banner PDFs) ko OCR karne ke liye
const visionModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

async function ocrPageImage(base64DataUrl) {
  try {
    const response = await visionModel.invoke([
      new HumanMessage({
        content: [
          {
            type: "text",
            text: "Extract all readable text from this image exactly as it appears, preserving structure where possible. Output only the raw extracted text — no commentary, no markdown formatting.",
          },
          { type: "image_url", image_url: base64DataUrl },
        ],
      }),
    ]);
    return response.text?.trim() || "";
  } catch (err) {
    console.error("OCR page extraction failed:", err);
    return "";
  }
}
import mammoth from "mammoth";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

async function extractText(buffer, mimetype) {
  if (mimetype === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    let text = "";

    try {
      const result = await parser.getText();
      text = result.text || "";

      // Agar text bahut kam mila (design/banner-style PDF jisme text actually
      // image ke pixels mein baked hai, koi real text-layer nahi) — OCR fallback chalao
      if (text.trim().length < 50) {
        const screenshotResult = await parser.getScreenshot({ scale: 1.5 });
        const ocrTexts = await Promise.all(
          screenshotResult.pages.map((page) => ocrPageImage(page.imageDataUrl)),
        );
        text = ocrTexts.filter(Boolean).join("\n\n");
      }
    } finally {
      await parser.destroy();
    }

    return text;
  }
  if (mimetype.includes("wordprocessingml")) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
  return "";
}

// ── Simple chunking (character-based, overlap ke saath) ──
function chunkText(text, chunkSize = 1000, overlap = 150) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks.filter((c) => c.trim().length > 20);
}

// ── Embed + Pinecone upsert ──
export async function ingestDocument({ buffer, mimetype, fileName, chatId, attachmentId }) {
  const text = await extractText(buffer, mimetype);

  if (!text || !text.trim()) {
    console.warn(`No extractable text found in "${fileName}" — skipping ingestion.`);
    return { chunksStored: 0 };
  }

  const chunks = chunkText(text);

  if (!chunks.length) {
    console.warn(`"${fileName}" produced 0 usable chunks after filtering — skipping ingestion.`);
    return { chunksStored: 0 };
  }

  const { embeddings } = await cohere.embed({
    texts: chunks,
    model: "embed-english-v3.0",
    inputType: "search_document",
  });

  console.log("DEBUG chunks.length:", chunks.length, "| embeddings type:", typeof embeddings, "| embeddings.length:", embeddings?.length);

  const vectors = chunks
    .map((chunk, i) => {
      if (!embeddings[i]) return null; // Cohere ne is chunk ke liye embedding nahi diya — skip
      return {
        id: `${attachmentId}-${i}`,
        values: embeddings[i],
        metadata: { chatId, fileName, text: chunk, attachmentId },
      };
    })
    .filter(Boolean);

  console.log("DEBUG vectors.length before upsert check:", vectors.length);

  // Upsert se pehle final safety check — Pinecone empty array pe hard-crash karta hai
  if (!vectors.length) {
    console.warn(`"${fileName}" ke liye koi valid vector nahi bana — upsert skip kar rahe hain.`);
    return { chunksStored: 0 };
  }

  // namespace = chatId → har chat ka data isolated rehta hai
  // chatId ko explicitly string banana zaroori hai — Mongoose ObjectId object
  // Pinecone SDK ke namespace()/upsert() ko confuse kar sakta hai
  await index.namespace(String(chatId)).upsert(vectors);
  return { chunksStored: vectors.length };
}

// ── Query-time retrieval ──
export async function retrieveContext(query, chatId, topK = 4) {
  if (!chatId) {
    console.log("DEBUG retrieveContext: chatId missing, skipping");
    return "";
  }

  const { embeddings } = await cohere.embed({
    texts: [query],
    model: "embed-english-v3.0",
    inputType: "search_query",
  });

  const result = await index.namespace(String(chatId)).query({
    vector: embeddings[0],
    topK,
    includeMetadata: true,
  });

  console.log(
    "DEBUG retrieveContext: namespace =",
    String(chatId),
    "| raw matches =",
    result.matches?.length || 0,
    "| scores =",
    result.matches?.map((m) => m.score.toFixed(3)),
  );

  const matches = result.matches?.filter((m) => m.score > 0.3) || [];
  console.log("DEBUG retrieveContext: matches after 0.3 filter =", matches.length);

  if (!matches.length) return "";

  return matches
    .map((m) => `[From ${m.metadata.fileName}]: ${m.metadata.text}`)
    .join("\n\n");
}