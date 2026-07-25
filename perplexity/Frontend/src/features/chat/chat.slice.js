import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: {},
  currentChatId: null,
  isLoading: false,
  error: null,
  aiStatus: null, // 'thinking' | 'typing' | null
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setcurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setAiStatus: (state, action) => {
      state.aiStatus = action.payload; // 'thinking' | 'typing' | null
    },
    removeLastAiMessage: (state, action) => {
      const { chatId } = action.payload;
      const chat = state.chats[chatId];
      if (!chat || !chat.messages.length) return;

      const lastMsg = chat.messages[chat.messages.length - 1];
      if (lastMsg?.role === "ai") {
        chat.messages.pop(); // poora hata do — naya bubble sirf pehle chunk pe banega
      }
    },
    createnewChat: (state, action) => {
      const { chatId, title } = action.payload;
      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          id: chatId,
          title: title || "New Chat",
          messages: [],
          lastUpdated: new Date().toISOString(),
        };
      } else if (title) {
        state.chats[chatId].title = title;
      }
    },
    addNewMessage: (state, action) => {
      const { chatId, content, role } = action.payload;
      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          id: chatId,
          title: "New Chat",
          messages: [],
          lastUpdated: new Date().toISOString(),
        };
      }
      state.chats[chatId].messages.push({ content, role });
      state.chats[chatId].lastUpdated = new Date().toISOString();
    },
    // ── Naye streaming reducers ──
    startStreamingMessage: (state, action) => {
      const { chatId } = action.payload;
      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          id: chatId,
          title: "New Chat",
          messages: [],
          lastUpdated: new Date().toISOString(),
        };
      }
      state.chats[chatId].messages.push({ content: "", role: "ai", streaming: true });
    },
    appendStreamingChunk: (state, action) => {
      const { chatId, chunk } = action.payload;
      const chat = state.chats[chatId];
      if (!chat) return;
      const lastMsg = chat.messages[chat.messages.length - 1];
      if (lastMsg?.role === "ai" && lastMsg.streaming) {
        lastMsg.content += chunk;
      }
    },
    finalizeStreamingMessage: (state, action) => {
      const { chatId, content } = action.payload;
      const chat = state.chats[chatId];
      if (!chat) return;
      const lastMsg = chat.messages[chat.messages.length - 1];
      if (lastMsg?.role === "ai") {
        if (content !== undefined) lastMsg.content = content;
        lastMsg.streaming = false;
      }
    },
    setChatMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          id: chatId,
          title: "New Chat",
          messages: [],
          lastUpdated: new Date().toISOString(),
        };
      }
      state.chats[chatId].messages = messages;
      state.chats[chatId].lastUpdated = new Date().toISOString();
    },
    // Edited message ko update karo, aur uske baad ki saari messages hata do
    truncateAfterMessage: (state, action) => {
      const { chatId, messageIndex, newContent } = action.payload;
      const chat = state.chats[chatId];
      if (!chat) return;

      // messageIndex tak (usko included) rakho, baaki sab hata do
      chat.messages = chat.messages.slice(0, messageIndex + 1);
      if (chat.messages[messageIndex]) {
        chat.messages[messageIndex].content = newContent;
      }
    },
    setLastUserMessageId: (state, action) => {
      const { chatId, messageId } = action.payload;
      const chat = state.chats[chatId];
      if (!chat || !chat.messages.length) return;

      // Sabse aakhri user-message dhoondo (jo abhi-abhi optimistically add hua tha)
      for (let i = chat.messages.length - 1; i >= 0; i--) {
        if (chat.messages[i].role === "user") {
          chat.messages[i]._id = messageId;
          break;
        }
      }
    },
    replaceChatId: (state, action) => {
      const { oldId, newId, title } = action.payload;
      if (state.chats[oldId]) {
        state.chats[newId] = {
          ...state.chats[oldId],
          id: newId,
          title: title || state.chats[oldId].title,
        };
        delete state.chats[oldId];
      }
    },
  },
});

export const {
  setChats,
  setcurrentChatId,
  setLoading,
  setError,
  setAiStatus,
  createnewChat,
  addNewMessage,
  startStreamingMessage,
  appendStreamingChunk,
  finalizeStreamingMessage,
  setChatMessages,
  replaceChatId,
  removeLastAiMessage,
  truncateAfterMessage,
  setLastUserMessageId
} = chatSlice.actions;
export default chatSlice.reducer;