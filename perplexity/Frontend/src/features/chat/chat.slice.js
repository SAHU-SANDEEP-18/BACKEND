import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [],
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
      state.isLoading = state.action;
    },
    setError: (state, action) => {
      state.error = state.action;
    },
    createnewChat: (state, action) => {
      const {chatId, title} = action.payload
      state.chatId[chatId] = {
        id: chatId,
        title,
        message: [],
        lastUpdated: new Date().toISOString()
      }
    },
    addNewMessage: (state, action) => {
      const {chatId, content, role} = action.payload
      state.chatId[chatId].message.push({content, role})
    }
  },
});

export const {
  setChats,
  setcurrentChatId,
  setLoading,
  setError,
  createnewChat,
  addNewMessage
} = chatSlice.actions;
export default chatSlice.reducer;
