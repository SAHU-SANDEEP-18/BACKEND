import {tavily as Tavily } from "@tavily/core"

const tavily = Tavily({
    apiKey: process.env.TAVILY_API_KEY
})

// Scraped text mein aksar extra whitespace, repeated newlines, aur
// navigation/ad junk hota hai — isko clean karte hain LLM ko dene se pehle
function cleanContent(text, maxLength = 350) {
  if (!text) return "";

  const cleaned = text
    .replace(/\s+/g, " ")           // multiple spaces/newlines ek space mein
    .replace(/\[\d+\]/g, "")        // citation markers jaise [1], [2] hatao
    .trim();

  return cleaned.length > maxLength
    ? cleaned.slice(0, maxLength) + "..."
    : cleaned;
}

export const searchInternet = async (query, { maxResults = 3, needsImages = false } = {}) => {
  const response = await tavily.search(query, {
    maxResults,
    searchDepth: "advanced",
    includeAnswer: true,
    includeImages: needsImages,
    includeImageDescriptions: needsImages,
  });

  return {
    ...response,
    results: (response.results || []).map((r) => ({
      ...r,
      content: cleanContent(r.content),
    })),
  };
};