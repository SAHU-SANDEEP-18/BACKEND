import { initializeSocketConnection } from "../service/chat.socket";
import { useDispatch } from "react-redux";
import { sendMessage, getChats, getMessages } from "../service/chat.api";
import {
  setChats,
  setcurrentChatId,
  setError,
  setLoading,
  createnewChat,
  addNewMessage,
  setChatMessages,
} from "../chat.slice";

export const useChat = () => {
  const dispatch = useDispatch();

  async function handleSendMessage({ message, chatId }) {
    if (!message?.trim()) return null;

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const data = await sendMessage({ message: message.trim(), chatId });
      const createdChatId = data.chat?._id || chatId;
      const title = data.chat?.title || data.title || "New Chat";

      if (createdChatId) {
        dispatch(
          createnewChat({
            chatId: createdChatId,
            title,
          })
        );
        dispatch(
          addNewMessage({
            chatId: createdChatId,
            content: message.trim(),
            role: "user",
          })
        );
        dispatch(
          addNewMessage({
            chatId: createdChatId,
            content: data.aiMessage?.content || "",
            role: data.aiMessage?.role || "ai",
          })
        );
        dispatch(setcurrentChatId(createdChatId));
      }

      return createdChatId;
    } catch (error) {
      dispatch(setError(error?.response?.data?.message || "Unable to send message"));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetChats() {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const data = await getChats();
      const chatMap = (data.chats || []).reduce((acc, chat) => {
        acc[chat._id] = {
          id: chat._id,
          title: chat.title || "New Chat",
          messages: [],
          lastUpdated: chat.updatedAt,
        };
        return acc;
      }, {});

      dispatch(setChats(chatMap));
      return chatMap;
    } catch (error) {
      dispatch(setError(error?.response?.data?.message || "Unable to fetch chats"));
      return {};
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetMessages(chatId) {
    if (!chatId) return null;

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const data = await getMessages(chatId);
      dispatch(setChatMessages({ chatId, messages: data.messages || [] }));
      return data.messages || [];
    } catch (error) {
      dispatch(setError(error?.response?.data?.message || "Unable to fetch messages"));
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    initializeSocketConnection,
    handleSendMessage,
    handleGetChats,
    handleGetMessages,
  };
};
