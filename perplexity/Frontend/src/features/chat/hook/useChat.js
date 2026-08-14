import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { store } from "../../../app/app.store";
import { initializeSocketConnection } from "../service/chat.socket";
import { useDispatch } from "react-redux";
import {
  sendMessageStream,
  regenerateMessageStream,
  editMessageStream,
  getChats,
  getMessages,
  renameChat,
  deleteChat,
} from "../service/chat.api";
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
  clearQuotedText,
  renameChatTitle,
  removeChat,
} from "../chat.slice";

export const useChat = () => {
  const dispatch = useDispatch();
  const abortControllerRef = useRef(null);
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserIdRef = useRef(null);
  currentUserIdRef.current = currentUser?._id || currentUser?.id;// current streaming request ka controller

  // ── Socket init + status listeners (ek hi baar setup) ──
  useEffect(() => {
    const socket = initializeSocketConnection(); // getSocket() ki jagah — yahi socket bhi bana dega

    socket.on("ai:thinking", () => dispatch(setAiStatus("thinking")));
    socket.on("ai:typing", () => dispatch(setAiStatus("typing")));
    socket.on("ai:done", () => dispatch(setAiStatus(null)));
    socket.on("ai:error", () => dispatch(setAiStatus(null)));

    let remoteStreamStarted = {};

    socket.on("chat:user-message", ({ chatId, message, senderId }) => {
      if (senderId === currentUserIdRef.current) return;
      dispatch(
        addNewMessage({
          chatId,
          content: message.content,
          role: "user",
          quotedText: message.quotedText,
          attachments: message.attachments,
        }),
      );
    });

    socket.on("chat:ai-thinking", ({ senderId }) => {
      if (senderId === currentUserIdRef.current) return;
      dispatch(setAiStatus("thinking"));
    });

    socket.on("chat:ai-chunk", ({ chatId, chunk, senderId }) => {
      if (senderId === currentUserIdRef.current) return;
      if (!remoteStreamStarted[chatId]) {
        dispatch(startStreamingMessage({ chatId }));
        remoteStreamStarted[chatId] = true;
      }
      dispatch(appendStreamingChunk({ chatId, chunk }));
    });

    socket.on("chat:ai-done", ({ chatId, senderId }) => {
      if (senderId === currentUserIdRef.current) return;
      dispatch(finalizeStreamingMessage({ chatId }));
      remoteStreamStarted[chatId] = false;
    });

    return () => {
      socket.off("ai:thinking");
      socket.off("ai:typing");
      socket.off("ai:done");
      socket.off("ai:error");
      socket.off("chat:user-message");
      socket.off("chat:ai-thinking");
      socket.off("chat:ai-chunk");
      socket.off("chat:ai-done");
    };
  }, [dispatch]);

  async function handleSendMessage({ message, chatId, quotedText, attachments }) {
    const hasAttachments = attachments && attachments.length > 0;
    if (!message?.trim() && !hasAttachments) return null;
    const trimmed = message?.trim() || "";

    dispatch(setLoading(true));
    dispatch(setError(null));

    const isNewChat = !chatId;
    const tempId = isNewChat ? `temp-${Date.now()}` : null;
    const activeChatId = chatId || tempId;

    if (isNewChat) {
      dispatch(createnewChat({ chatId: tempId, title: "New Chat" }));
    }
    dispatch(
      addNewMessage({
        chatId: activeChatId,
        content: trimmed,
        role: "user",
        quotedText,
        attachments,
      }),
    );
    dispatch(setcurrentChatId(activeChatId));
    dispatch(clearQuotedText());

    // Local client should show AI thinking immediately for user's own request
    dispatch(setAiStatus("thinking"));

    let finalChatId = activeChatId;

    let streamStarted = false;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await sendMessageStream({ message: trimmed, chatId, quotedText, attachments }, (event) => {
          if (event.type === "meta") {
            if (isNewChat && event.chatId) {
              dispatch(
                replaceChatId({
                  oldId: tempId,
                  newId: event.chatId,
                  title: event.title,
                }),
              );
              dispatch(setcurrentChatId(event.chatId));
              finalChatId = event.chatId;
            }
            if (event.userMessageId) {
              dispatch(
                setLastUserMessageId({
                  chatId: finalChatId,
                  messageId: event.userMessageId,
                }),
              );
            }
            // Yahan bubble nahi banate — jab tak "Thinking..." chal raha hai, indicator hi dikhega
          } else if (event.type === "chunk") {
            if (!streamStarted) {
              dispatch(startStreamingMessage({ chatId: finalChatId }));
              streamStarted = true;
            }
            dispatch(
              appendStreamingChunk({ chatId: finalChatId, chunk: event.chunk }),
            );
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
            dispatch(setAiStatus(null));
          } else if (event.type === "error") {
            dispatch(setError(event.error));
            if (streamStarted)
              dispatch(finalizeStreamingMessage({ chatId: finalChatId }));
            dispatch(setAiStatus(null));
          }
        },
        controller.signal,
      );

      return finalChatId;
    } catch (error) {
      // AbortError tab aati hai jab user ne khud stop kiya — usko error mat treat karo
      if (error.name !== "AbortError") {
        dispatch(setError(error?.message || "Unable to send message"));
      }
      return null;
    } finally {
      dispatch(setLoading(false));
      dispatch(setAiStatus(null));
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

    // Show thinking indicator locally while regenerating
    dispatch(setAiStatus("thinking"));

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
              dispatch(setAiStatus(null));
            }
          } else if (event.type === "error") {
            dispatch(setError(event.error));
            if (streamStarted) dispatch(finalizeStreamingMessage({ chatId }));
            dispatch(setAiStatus(null));
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
      dispatch(setAiStatus(null));
      abortControllerRef.current = null;
    }
  }

  async function handleEditMessage({
    chatId,
    messageId,
    messageIndex,
    newContent,
  }) {
    if (!chatId || !newContent?.trim()) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(
      truncateAfterMessage({
        chatId,
        messageIndex,
        newContent: newContent.trim(),
      }),
    );

    // Show thinking indicator locally while editing
    dispatch(setAiStatus("thinking"));

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
              dispatch(setAiStatus(null));
            }
          } else if (event.type === "error") {
            dispatch(setError(event.error));
            if (streamStarted) dispatch(finalizeStreamingMessage({ chatId }));
            dispatch(setAiStatus(null));
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
      dispatch(setAiStatus(null));
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
          folderId: chat.folderId || null,
          messages: [],
          lastUpdated: chat.updatedAt,
        };
        return acc;
      }, {});

      dispatch(setChats(chatMap));
      return chatMap;
    } catch (error) {
      dispatch(
        setError(error?.response?.data?.message || "Unable to fetch chats"),
      );
      return {};
    } finally {
      dispatch(setLoading(false));
    }
  }
  async function handleRenameChat(chatId, title) {
    if (!chatId || !title?.trim()) return;
    try {
      await renameChat(chatId, title.trim());
      dispatch(renameChatTitle({ chatId, title: title.trim() }));
    } catch (error) {
      dispatch(
        setError(error?.response?.data?.message || "Unable to rename chat"),
      );
    }
  }

  async function handleDeleteChat(chatId) {
    if (!chatId) return;
    try {
      await deleteChat(chatId);
      dispatch(removeChat({ chatId }));
    } catch (error) {
      dispatch(
        setError(error?.response?.data?.message || "Unable to delete chat"),
      );
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
      dispatch(
        setError(error?.response?.data?.message || "Unable to fetch messages"),
      );
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  }

  // ── React to a message (optimistic update + server call) ──
  async function handleReaction({ chatId, messageId, messageIndex, reaction }) {
    if (!chatId || messageIndex === undefined) return;

    // If message doesn't have a server id yet, disallow reacting
    if (!messageId) {
      dispatch(setError("Can't react to unsaved message yet"));
      return;
    }

    // get previous reaction to allow revert on failure
    const prevReaction = store.getState().chat.chats?.[chatId]?.messages?.[messageIndex]?.reaction || null;

    // optimistic update
    dispatch({ type: "chat/setMessageReaction", payload: { chatId, messageIndex, reaction } });

    try {
      const api = await import("../service/chat.api");
      await api.reactToMessage(messageId, reaction);
    } catch (error) {
      // revert optimistic update
      dispatch({ type: "chat/setMessageReaction", payload: { chatId, messageIndex, reaction: prevReaction } });
      dispatch(setError(error?.response?.data?.message || error?.message || "Unable to react to message"));
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
    handleReaction,
    handleRenameChat,
    handleDeleteChat,
  };
};
