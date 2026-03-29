import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  createChatCompletion,
  requestAccessToken,
  streamChatCompletion,
  type GigaChatAuthConfig,
  type GigaChatMessage,
} from '../../api/gigachat';
import { loadChatState, saveChatState } from '../../utils/storage';
import type { Chat, ChatAction, ChatState, Message } from '../../types/chat';

interface ChatProviderProps {
  auth: GigaChatAuthConfig;
  children: React.ReactNode;
}

interface ChatContextValue {
  state: ChatState;
  createChat: () => string;
  selectChat: (chatId: string | null) => void;
  renameChat: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;
  sendMessage: (chatId: string | null, content: string) => Promise<string>;
  stopGenerating: () => void;
  clearError: () => void;
}

const DEFAULT_CHAT_STATE: ChatState = {
  chats: [],
  activeChatId: null,
  isLoading: false,
  error: null,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'CREATE_CHAT':
      return {
        ...state,
        chats: [action.payload, ...state.chats],
        activeChatId: action.payload.id,
      };
    case 'SET_ACTIVE_CHAT':
      return {
        ...state,
        activeChatId: action.payload,
      };
    case 'RENAME_CHAT': {
      const chats = state.chats.map((chat) =>
        chat.id === action.payload.chatId ? { ...chat, title: action.payload.title } : chat
      );
      return { ...state, chats };
    }
    case 'DELETE_CHAT': {
      const chats = state.chats.filter((chat) => chat.id !== action.payload.chatId);
      const activeChatId =
        state.activeChatId === action.payload.chatId ? (chats[0]?.id ?? null) : state.activeChatId;
      return { ...state, chats, activeChatId };
    }
    case 'ADD_MESSAGE': {
      const chats = state.chats.map((chat) => {
        if (chat.id !== action.payload.chatId) return chat;
        return {
          ...chat,
          messages: [...chat.messages, action.payload.message],
          updatedAt: action.payload.message.timestamp,
        };
      });
      return { ...state, chats };
    }
    case 'APPEND_TO_MESSAGE': {
      const chats = state.chats.map((chat) => {
        if (chat.id !== action.payload.chatId) return chat;
        return {
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === action.payload.messageId
              ? { ...message, content: message.content + action.payload.chunk }
              : message
          ),
        };
      });
      return { ...state, chats };
    }
    case 'SET_MESSAGE_CONTENT': {
      const chats = state.chats.map((chat) => {
        if (chat.id !== action.payload.chatId) return chat;
        return {
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === action.payload.messageId
              ? { ...message, content: action.payload.content }
              : message
          ),
        };
      });
      return { ...state, chats };
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const ChatContext = createContext<ChatContextValue | null>(null);

const nowIso = () => new Date().toISOString();

const nowTime = () =>
  new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

const truncateTitle = (text: string) => {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  if (cleaned.length < 5) return '';
  if (cleaned.length <= 40) return cleaned;
  return `${cleaned.slice(0, 37)}...`;
};

const makeDialogTitle = (state: ChatState) => `Диалог ${state.chats.length + 1}`;

const makeNewChat = (state: ChatState): Chat => {
  const ts = nowIso();
  return {
    id: crypto.randomUUID(),
    title: makeDialogTitle(state),
    createdAt: ts,
    updatedAt: ts,
    messages: [],
  };
};

const mapMessagesForApi = (messages: Message[]): GigaChatMessage[] => {
  const dialogue = messages
    .filter((message) => message.role === 'user' || message.role === 'assistant' || message.role === 'system')
    .map((message) => ({ role: message.role, content: message.content }));

  const hasSystem = dialogue.some((message) => message.role === 'system');
  if (hasSystem) return dialogue;

  return [
    {
      role: 'system',
      content: 'Ты полезный ИИ-ассистент. Отвечай кратко, структурно и по делу на русском языке.',
    },
    ...dialogue,
  ];
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ auth, children }) => {
  const [state, dispatch] = useReducer(chatReducer, DEFAULT_CHAT_STATE);
  const stateRef = useRef(state);
  const abortRef = useRef<AbortController | null>(null);
  const tokenRef = useRef<{ token: string; expiresAt: number } | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const persisted = loadChatState();
    if (persisted) {
      dispatch({ type: 'HYDRATE', payload: persisted });
    }
  }, []);

  useEffect(() => {
    saveChatState(state);
  }, [state]);

  const createChat = useCallback(() => {
    const chat = makeNewChat(stateRef.current);
    dispatch({ type: 'CREATE_CHAT', payload: chat });
    return chat.id;
  }, []);

  const selectChat = useCallback((chatId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
  }, []);

  const renameChat = useCallback((chatId: string, title: string) => {
    const normalized = title.trim();
    if (!normalized) return;
    dispatch({ type: 'RENAME_CHAT', payload: { chatId, title: normalized } });
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    dispatch({ type: 'DELETE_CHAT', payload: { chatId } });
  }, []);

  const ensureToken = useCallback(async () => {
    const cached = tokenRef.current;
    const now = Date.now();

    if (cached && cached.expiresAt - 30_000 > now) {
      return cached.token;
    }

    const next = await requestAccessToken(auth);
    tokenRef.current = {
      token: next.access_token,
      expiresAt: next.expires_at,
    };

    return next.access_token;
  }, [auth]);

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const sendMessage = useCallback(
    async (chatId: string | null, content: string) => {
      const text = content.trim();
      if (!text || stateRef.current.isLoading) {
        return chatId ?? stateRef.current.activeChatId ?? '';
      }

      let targetChatId = chatId ?? stateRef.current.activeChatId;
      let targetChat = stateRef.current.chats.find((chat) => chat.id === targetChatId);

      if (!targetChatId || !targetChat) {
        targetChat = makeNewChat(stateRef.current);
        targetChatId = targetChat.id;
        dispatch({ type: 'CREATE_CHAT', payload: targetChat });
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: nowTime(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId: targetChatId, message: userMessage } });

      if (targetChat.messages.length === 0) {
        const autoTitle = truncateTitle(text) || targetChat.title || 'Новый чат';
        dispatch({ type: 'RENAME_CHAT', payload: { chatId: targetChatId, title: autoTitle } });
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: nowTime(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId: targetChatId, message: assistantMessage } });

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const abortController = new AbortController();
      abortRef.current = abortController;

      const apiMessages = mapMessagesForApi([...targetChat.messages, userMessage]);

      try {
        const accessToken = await ensureToken();
        let streamed = false;
        let wasAborted = false;

        try {
          await streamChatCompletion({
            accessToken,
            messages: apiMessages,
            signal: abortController.signal,
            onToken: (token) => {
              streamed = true;
              dispatch({
                type: 'APPEND_TO_MESSAGE',
                payload: { chatId: targetChatId, messageId: assistantMessage.id, chunk: token },
              });
            },
          });
        } catch {
          if (abortController.signal.aborted) {
            wasAborted = true;
          }

          if (wasAborted) {
            dispatch({
              type: 'SET_MESSAGE_CONTENT',
              payload: { chatId: targetChatId, messageId: assistantMessage.id, content: 'Генерация остановлена.' },
            });
          } else {
            const responseText = await createChatCompletion({
              accessToken,
              messages: apiMessages,
              signal: abortController.signal,
            });
            dispatch({
              type: 'SET_MESSAGE_CONTENT',
              payload: { chatId: targetChatId, messageId: assistantMessage.id, content: responseText },
            });
            streamed = true;
          }
        }

        if (!streamed && !wasAborted) {
          dispatch({
            type: 'SET_MESSAGE_CONTENT',
            payload: {
              chatId: targetChatId,
              messageId: assistantMessage.id,
              content: 'Ответ пуст. Попробуйте переформулировать вопрос.',
            },
          });
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          return targetChatId;
        }
        const message = error instanceof Error ? error.message : 'Ошибка сети при запросе к GigaChat API.';
        dispatch({
          type: 'SET_MESSAGE_CONTENT',
          payload: { chatId: targetChatId, messageId: assistantMessage.id, content: `Ошибка: ${message}` },
        });
        dispatch({ type: 'SET_ERROR', payload: message });
      } finally {
        abortRef.current = null;
        dispatch({ type: 'SET_LOADING', payload: false });
      }

      return targetChatId;
    },
    [ensureToken]
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      state,
      createChat,
      selectChat,
      renameChat,
      deleteChat,
      sendMessage,
      stopGenerating,
      clearError,
    }),
    [state, createChat, selectChat, renameChat, deleteChat, sendMessage, stopGenerating, clearError]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used inside ChatProvider');
  }
  return context;
};
