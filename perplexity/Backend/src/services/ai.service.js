import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  createAgent,
  tool,
} from "langchain";
import * as z from "zod";
import { searchInternet } from "./internet.service.js";
import { retrieveContext } from "./rag.service.js";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

// Raw Tavily notes ko ek chhoti, alag Mistral-call se clean facts mein convert karte hain.
// Isse main agent ke paas kabhi raw/messy text pahunchta hi nahi — sirf clean summary jaata hai.
async function summarizeSearchResults(query, results, answer) {
  const rawNotes = results
    .map((r, i) => `Source ${i + 1}: ${r.content}`)
    .join("\n\n");

  const combined = answer ? `${answer}\n\n${rawNotes}` : rawNotes;

  try {
    const response = await mistralModel.invoke([
      new SystemMessage(
        `You extract clean facts from messy web-scraped search results. ` +
        `Output the key facts relevant to the query as ONE short plain-text paragraph (2-4 sentences, no line breaks). ` +
        `Do NOT use bullet points, numbered lists, headings, markdown, or any list format — plain flowing prose only, like a sentence you'd say out loud. ` +
        `No source names, no raw tables, no URLs, no extra commentary. ` +
        `Ignore junk fragments like "Temporarily Unavailable" or broken symbols.`
      ),
      new HumanMessage(`Query: "${query}"\n\nRaw search data:\n${combined}`),
    ]);

    return response.text?.trim() || "No relevant information found.";
  } catch (err) {
    console.error("Summarization failed:", err);
    return answer || "No relevant information found.";
  }
}

const searchInternetTool = tool(
  async ({ query }) => {
    try {
      const { results, answer } = await searchInternet(query);
      if (!results?.length) return "No relevant information found.";

      // Sirf clean, pre-summarized facts return karte hain — kabhi raw content nahi
      const cleanSummary = await summarizeSearchResults(query, results, answer);
      return cleanSummary;
    } catch (err) {
      return `Search failed: ${err.message}`;
    }
  },
  {
    name: "searchInternet",
    description:
      "Searches the internet for up-to-date or factual information. Use ONLY when the query needs current events, real-time data, or facts outside your knowledge.",
    schema: z.object({
      query: z.string().describe("A concise, specific search query (3-8 words)."),
    }),
  },
);

const SYSTEM_PROMPT = `You are a helpful assistant. Your primary goal is to follow the user's requested tone, language, and verbosity exactly, even if that means using a casual mixed-language style like Hinglish.

Tool usage — CRITICAL RULES:
- Always use the searchInternet tool for questions about current events, recent data, prices, news, or anything that may have changed after your training cutoff.
- The tool's "Additional notes" section is RAW REFERENCE MATERIAL ONLY. You must NEVER copy, paste, or reproduce it in your answer — not even partially, not even reformatted with pipes or tables.
- Never include a "Sources:" section with pasted content, raw tables, broken symbols, or dumped text from the tool output.
- Instead: read the notes, extract only the 2-4 facts that directly answer the user's question, and write them as clean original sentences.
- If you want to credit a source, mention its name naturally inside a sentence (e.g. "According to weather25.com, temperatures typically..."). Never dump a raw URL block or a list of sources at the end.

Formatting rules for every response:
- Answer the user's actual question first, directly, in 1-3 short sentences.
- Only add a "## " or "### " heading section if the question genuinely needs multiple structured parts (e.g. a multi-day forecast, a comparison). Do not add headings for simple one-fact answers.
- Use **bold** only for the key numbers/terms the user asked about.
- Use a small Markdown table ONLY if the user asked to compare multiple days/items — keep it to 3-5 rows max, not a dump of every data point available.
- Never include broken words, stray symbols, or fragments from scraped web pages (e.g. "\\Temporarily Unavailable", "##", random pipe characters) — if the raw notes contain junk like this, ignore it entirely.
- Keep the total answer concise — a weather question should be answerable in under 80 words unless the user explicitly asks for a detailed forecast.
- CRITICAL: Produce exactly ONE version of the answer. Never state the same facts twice — not as a bullet list followed by a restating paragraph, not as a summary followed by a repeated summary. Pick ONE format (either short bullets OR a short paragraph, not both) and say each fact only once.
- The searchInternet tool's output is raw reference material — it is NOT a draft of your answer and must never be echoed, reformatted, or reused as a list. Read it, extract only what's needed, and write your own single-pass answer from scratch.
- WRONG example (never do this): "- LAMP stack\n- MEAN stack\n\nThe LAMP stack and MEAN stack are popular choices..." — this repeats the same facts twice in two formats. Write it only once instead.
- If the user requests short answers, respond short. If the user requests Hinglish, reply in natural mixed Hindi-English. If the user requests a certain style, follow it over the generic formatting rules above.`;

// Har request ke liye custom-instructions ke sath final system-prompt banate hain
function buildSystemPrompt(customInstructions) {
  if (!customInstructions?.trim()) return SYSTEM_PROMPT;

  return `${SYSTEM_PROMPT}\n\nIMPORTANT: The following user preferences are the highest-priority style rules for this conversation. Follow them before the generic formatting defaults, unless they would break safety or factual correctness.\n\nUser custom style instructions:\n${customInstructions.trim()}\n\nStyle enforcement:\n- Prefer the user's requested language and tone.\n- If the user says "short" or "Hinglish", keep replies concise and mixed Hindi-English naturally.\n- Do not add extra explanation or long preambles when the user wants brevity.`;
}

// Agent ab har call pe custom-instructions ke sath fresh banega (kyunki systemPrompt static nahi rahega)
function buildAgent(customInstructions) {
  return createAgent({
    model: geminiModel,
    tools: [searchInternetTool],
    systemPrompt: buildSystemPrompt(customInstructions),
  });
}

// ImageKit ka public-URL fetch karke base64 data-URL mein convert karta hai —
// @langchain/google-genai ko plain HTTPS-URL nahi chahiye, base64 chahiye hota hai
async function urlToBase64DataUrl(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");

  // content-type header kabhi-kabhi extra junk ke saath aata hai — jaise
  // "image/jpeg; charset=UTF-8" (semicolon params) ya kuch CDNs duplicate
  // header bhejte hain jise fetch() comma se join kar deta hai
  // (e.g. "image/jpeg, image/jpeg"). Dono cases mein sirf clean
  // "type/subtype" pattern regex se nikaal lete hain, baaki sab discard.
  const rawContentType = response.headers.get("content-type") || "";
  const mimeMatch = rawContentType.match(/[a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+/);
  const mimeType = mimeMatch ? mimeMatch[0] : "image/jpeg";

  return `data:${mimeType};base64,${base64}`;
}

const formatMessages = async (messages) => {
  const formatted = await Promise.all(
    messages.map(async (msg) => {
      if (msg.role === "user") {
        const textContent = msg.quotedText
          ? `> ${msg.quotedText}\n\n${msg.content}`
          : msg.content;

        const imageAttachments = (msg.attachments || []).filter((a) => a.kind === "image");

        if (imageAttachments.length > 0) {
          const content = [{ type: "text", text: textContent || "" }];

          for (const img of imageAttachments) {
            try {
              const dataUrl = await urlToBase64DataUrl(img.url);
              content.push({ type: "image_url", image_url: dataUrl });
            } catch (err) {
              console.error("Image fetch/convert failed:", err);
            }
          }

          return new HumanMessage({ content });
        }

        return new HumanMessage(textContent);
      }
      if (msg.role === "ai") return new AIMessage(msg.content);
      return null;
    }),
  );

  return formatted.filter(Boolean);
};

export async function generateResponse(messages, chatId, customInstructions) {
  const formatted = await formatMessages(messages);
  await injectRagContext(formatted, messages, chatId);
  const agent = buildAgent(customInstructions);
  const response = await agent.invoke({ messages: formatted });
  return response.messages[response.messages.length - 1].text;
}

// Document (PDF/DOCX) se related chunks nikaal ke last user-message ke andar hi prepend karta hai.
// (SystemMessage nahi banate — createAgent khud ek internal system-message manage karta hai,
// aur do system-messages ek sath dene se Gemini "System message should be the first one" error deta hai.)
async function injectRagContext(formatted, rawMessages, chatId) {
  if (!chatId) return;
  const lastUserMsg = rawMessages.filter((m) => m.role === "user").at(-1)?.content || "";
  if (!lastUserMsg.trim()) return;

  try {
    const ragContext = await retrieveContext(lastUserMsg, chatId);
    if (!ragContext) return;

    // Array mein sabse aakhri HumanMessage dhoondo aur usके content ke shuru mein context daal do
    for (let i = formatted.length - 1; i >= 0; i--) {
      if (formatted[i]._getType?.() === "human") {
        const contextPrefix = `[Relevant context from an uploaded document — use this only if it helps answer the question, don't mention chunks/embeddings, cite the document name naturally if useful]\n${ragContext}\n\n[End of context]\n\n`;

        if (typeof formatted[i].content === "string") {
          formatted[i].content = contextPrefix + formatted[i].content;
        } else if (Array.isArray(formatted[i].content)) {
          // Multimodal message (image ke saath) — text-part ke shuru mein prepend karo
          const textPart = formatted[i].content.find((c) => c.type === "text");
          if (textPart) {
            textPart.text = contextPrefix + (textPart.text || "");
          } else {
            formatted[i].content.unshift({ type: "text", text: contextPrefix });
          }
        }
        break;
      }
    }
  } catch (err) {
    console.error("RAG retrieval failed:", err);
    // fail silently — AI bina document-context ke bhi normal jawaab de sake
  }
}

export async function* generateResponseStream(messages, signal, chatId, customInstructions) {
  const formatted = await formatMessages(messages);
  await injectRagContext(formatted, messages, chatId);
  const agent = buildAgent(customInstructions);
  const stream = await agent.stream(
    { messages: formatted },
    { streamMode: "messages", signal },
  );

  try {
    for await (const [chunk, metadata] of stream) {
      if (signal?.aborted) break; // extra safety — turant loop se nikal jao

      const isToolCallChunk = chunk?.tool_call_chunks?.length > 0;

      if (chunk?.content && !isToolCallChunk) {
        yield chunk.content;
      }
    }
  } finally {
    if (typeof stream.return === "function") {
      try {
        await stream.return();
      } catch {
        // ignore — cleanup ke dauraan error irrelevant hai
      }
    }
  }
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`You are a creative assistant that generates short, catchy titles for chat conversations.
    - Titles must be concise (2–3 words).
    - Titles should capture the main theme or intent of the user's first message.
    - Avoid generic words like "Chat" or "Conversation".
    - Prefer action-oriented or topic-specific phrasing.
    - Output only the title text, no explanations.
  `),
    new HumanMessage(`
    First message: "${message}"
    Generate the best possible title.
  `),
  ]);

  return response.text;
}