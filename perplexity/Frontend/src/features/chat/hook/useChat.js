import { useEffect, useRef } from "react";
import { initializeSocketConnection } from "../service/chat.socket";
import { useDispatch } from "react-redux";
import { sendMessageStream, regenerateMessageStream, editMessageStream, getChats, getMessages } from "../service/chat.api";
import {
  setChats,
  setcurrentChatId,
  setError,
  setLoading,
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
  setLastUserMessageId,
} from "../chat.slice";

export const useChat = () => {
  const dispatch = useDispatch();
  const abortControllerRef = useRef(null); // current streaming request ka controller

  // ── Socket init + status listeners (ek hi baar setup) ──
  useEffect(() => {
    const socket = initializeSocketConnection(); // getSocket() ki jagah — yahi socket bhi bana dega

    socket.on("ai:thinking", () => dispatch(setAiStatus("thinking")));
    socket.on("ai:typing", () => dispatch(setAiStatus("typing")));
    socket.on("ai:done", () => dispatch(setAiStatus(null)));
    socket.on("ai:error", () => dispatch(setAiStatus(null)));

    return () => {
      socket.off("ai:thinking");
      socket.off("ai:typing");
      socket.off("ai:done");
      socket.off("ai:error");
    };
  }, [dispatch]);

  async function handleSendMessage({ message, chatId }) {
    if (!message?.trim()) return null;
    const trimmed = message.trim();

    dispatch(setLoading(true));
    dispatch(setError(null));

    const isNewChat = !chatId;
    const tempId = isNewChat ? `temp-${Date.now()}` : null;
    const activeChatId = chatId || tempId;

    if (isNewChat) {
      dispatch(createnewChat({ chatId: tempId, title: "New Chat" }));
    }
    dispatch(addNewMessage({ chatId: activeChatId, content: trimmed, role: "user" }));
    dispatch(setcurrentChatId(activeChatId));

    let finalChatId = activeChatId;

    let streamStarted = false;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await sendMessageStream({ message: trimmed, chatId }, (event) => {
        if (event.type === "meta") {
          if (isNewChat && event.chatId) {
            dispatch(replaceChatId({ oldId: tempId, newId: event.chatId, title: event.title }));
            dispatch(setcurrentChatId(event.chatId));
            finalChatId = event.chatId;
          }
          if (event.userMessageId) {
            dispatch(setLastUserMessageId({ chatId: finalChatId, messageId: event.userMessageId }));
          }
          // Yahan bubble nahi banate — jab tak "Thinking..." chal raha hai, indicator hi dikhega
        } else if (event.type === "chunk") {
          if (!streamStarted) {
            dispatch(startStreamingMessage({ chatId: finalChatId }));
            streamStarted = true;
          }
          dispatch(appendStreamingChunk({ chatId: finalChatId, chunk: event.chunk }));
        } else if (event.type === "done") {
          if (streamStarted) {
            dispatch(finalizeStreamingMessage({ chatId: finalChatId }));
          } else {
            // Koi chunk hi nahi aaya (edge case) — seedha final message daal do
            dispatch(
              addNewMessage({
                chatId: finalChatId,
                content: event.aiMessage?.content || "",
                role: "ai",
              }),
            );
          }
        } else if (event.type === "error") {
          dispatch(setError(event.error));
          if (streamStarted) dispatch(finalizeStreamingMessage({ chatId: finalChatId }));
        }
      }, controller.signal);

      return finalChatId;
    } catch (error) {
      // AbortError tab aati hai jab user ne khud stop kiya — usko error mat treat karo
      if (error.name !== "AbortError") {
        dispatch(setError(error?.message || "Unable to send message"));
      }
      return null;
    } finally {
      dispatch(setLoading(false));
      abortControllerRef.current = null;
    }
  }

  // ── Stop generation — active stream ko cancel karta hai ──
  function handleStopGeneration() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }

  async function handleRegenerate(chatId) {
    if (!chatId) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(removeLastAiMessage({ chatId })); // purana hata do, naya "Thinking..." indicator hi dikhega tab tak

    let streamStarted = false;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await regenerateMessageStream(
        chatId,
        (event) => {
          if (event.type === "chunk") {
            if (!streamStarted) {
              dispatch(startStreamingMessage({ chatId }));
              streamStarted = true;
            }
            dispatch(appendStreamingChunk({ chatId, chunk: event.chunk }));
          } else if (event.type === "done") {
            if (streamStarted) {
              dispatch(finalizeStreamingMessage({ chatId }));
            }
          } else if (event.type === "error") {
            dispatch(setError(event.error));
            if (streamStarted) dispatch(finalizeStreamingMessage({ chatId }));
          }
        },
        controller.signal,
      );
    } catch (error) {
      if (error.name !== "AbortError") {
        dispatch(setError(error?.message || "Unable to regenerate response"));
      }
    } finally {
      dispatch(setLoading(false));
      abortControllerRef.current = null;
    }
  }

  async function handleEditMessage({ chatId, messageId, messageIndex, newContent }) {
    if (!chatId || !newContent?.trim()) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(truncateAfterMessage({ chatId, messageIndex, newContent: newContent.trim() }));

    let streamStarted = false;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await editMessageStream(
        chatId,
        messageId,
        newContent.trim(),
        (event) => {
          if (event.type === "chunk") {
            if (!streamStarted) {
              dispatch(startStreamingMessage({ chatId }));
              streamStarted = true;
            }
            dispatch(appendStreamingChunk({ chatId, chunk: event.chunk }));
          } else if (event.type === "done") {
            if (streamStarted) {
              dispatch(finalizeStreamingMessage({ chatId }));
            }
          } else if (event.type === "error") {
            dispatch(setError(event.error));
            if (streamStarted) dispatch(finalizeStreamingMessage({ chatId }));
          }
        },
        controller.signal,
      );
    } catch (error) {
      if (error.name !== "AbortError") {
        dispatch(setError(error?.message || "Unable to edit message"));
      }
    } finally {
      dispatch(setLoading(false));
      abortControllerRef.current = null;
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
    handleStopGeneration,
    handleRegenerate,
    handleEditMessage,
  };
};