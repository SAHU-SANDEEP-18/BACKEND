import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function generateResponse(messages) {
  const response = await geminiModel.invoke(messages.map(msg=>{
    if(msg.role == "user"){
      return new HumanMessage(msg.content)
    }else if (msg.role == "ai"){
      return new AIMessage(msg.content)
    }
  }));

  return response.text;
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
