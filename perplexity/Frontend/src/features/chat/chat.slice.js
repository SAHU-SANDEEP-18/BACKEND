import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [],
  activeChat: null,
  messages: [],
  replyTo: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setReplyTo: (state, action) => {
      state.replyTo = action.payload;
    },
    clearReplyTo: (state) => {
      state.replyTo = null;
    },
  },
});

export const { setChats, setActiveChat, addMessage, setReplyTo, clearReplyTo } = chatSlice.actions;
export default chatSlice.reducer;
