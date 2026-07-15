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
  replaceChatId,
} from "../chat.slice";

export const useChat = () => {
  const dispatch = useDispatch();

async function handleSendMessage({ message, chatId }) {
    if (!message?.trim()) return null;
    const trimmed = message.trim();

    dispatch(setLoading(true));
    dispatch(setError(null));

    const isNewChat = !chatId;
    const tempId = isNewChat ? `temp-${Date.now()}` : null;
    const activeChatId = chatId || tempId;

    // ── Optimistic: show user's message immediately, before API responds ──
    if (isNewChat) {
      dispatch(createnewChat({ chatId: tempId, title: "New Chat" }));
    }
    dispatch(
      addNewMessage({
        chatId: activeChatId,
        content: trimmed,
        role: "user",
      })
    );
    dispatch(setcurrentChatId(activeChatId));

    try {
      const data = await sendMessage({ message: trimmed, chatId });
      const createdChatId = data.chat?._id || chatId;
      const title = data.chat?.title || data.title || "New Chat";

      let finalChatId = activeChatId;

      if (isNewChat && createdChatId) {
        dispatch(replaceChatId({ oldId: tempId, newId: createdChatId, title }));
        dispatch(setcurrentChatId(createdChatId));
        finalChatId = createdChatId;
      }

      dispatch(
        addNewMessage({
          chatId: finalChatId,
          content: data.aiMessage?.content || "",
          role: data.aiMessage?.role || "ai",
        })
      );

      return finalChatId;
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
