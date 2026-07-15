import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: {},
  currentChatId: null,
  isLoading: false,
  error: null,
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
  createnewChat,
  addNewMessage,
  setChatMessages,
  replaceChatId,
} = chatSlice.actions;
export default chatSlice.reducer;
