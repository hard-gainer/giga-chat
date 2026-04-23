import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  createChatCompletion,
  getAvailableModels,
  requestAccessToken,
  streamChatCompletion,
  type ChatRequestSettings,
  type GigaChatContentPart,
  type GigaChatAuthConfig,
  type GigaChatMessage,
} from '../../api/gigachat';
import { loadChatState, saveChatState } from '../../utils/storage';
import { chatReducer, DEFAULT_CHAT_STATE } from '../../store/chatReducer';
import type { Chat, ChatState, Message } from '../../types/chat';

interface ChatProviderProps {
  auth: GigaChatAuthConfig;
  children: React.ReactNode;
}

interface ChatContextValue {
  state: ChatState;
  settings: ChatRequestSettings & { systemPrompt: string };
  availableModels: string[];
  createChat: () => string;
  selectChat: (chatId: string | null) => void;
  renameChat: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;
  updateSettings: (nextSettings: ChatRequestSettings & { systemPrompt: string }) => void;
  refreshModels: () => Promise<void>;
  sendMessage: (chatId: string | null, content: string, imageDataUrl?: string | null) => Promise<string>;
  stopGenerating: () => void;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const DEFAULT_MODELS = ['GigaChat', 'GigaChat-Plus', 'GigaChat-Pro', 'GigaChat-Max'];

const DEFAULT_SETTINGS: ChatRequestSettings & { systemPrompt: string } = {
  model: 'GigaChat',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 1024,
  repetitionPenalty: 1,
  systemPrompt: 'Ты полезный ИИ-ассистент. Отвечай кратко, структурно и по делу на русском языке.',
};

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

const mapMessagesForApi = (messages: Message[], systemPrompt: string): GigaChatMessage[] => {
  const dialogue = messages
    .filter((message) => message.role === 'user' || message.role === 'assistant' || message.role === 'system')
    .map((message) => {
      if (message.role === 'user' && message.imageDataUrl) {
        const parts: GigaChatContentPart[] = [];
        if (message.content.trim()) {
          parts.push({ type: 'text', text: message.content });
        }
        parts.push({ type: 'image_url', image_url: { url: message.imageDataUrl } });
        return { role: message.role, content: parts };
      }

      return { role: message.role, content: message.content };
    });

  const hasSystem = dialogue.some((message) => message.role === 'system');
  if (hasSystem) return dialogue;

  return [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...dialogue,
  ];
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ auth, children }) => {
  const [state, dispatch] = useReducer(chatReducer, DEFAULT_CHAT_STATE);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [availableModels, setAvailableModels] = useState<string[]>(DEFAULT_MODELS);
  const stateRef = useRef(state);
  const settingsRef = useRef(settings);
  const abortRef = useRef<AbortController | null>(null);
  const tokenRef = useRef<{ token: string; expiresAt: number } | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

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

  const refreshModels = useCallback(async () => {
    const accessToken = await ensureToken();
    const models = await getAvailableModels({ accessToken });
    if (models.length > 0) {
      setAvailableModels(models);

      if (!models.includes(settingsRef.current.model)) {
        setSettings((current) => ({ ...current, model: models[0] }));
      }
    }
  }, [ensureToken]);

  useEffect(() => {
    void refreshModels().catch(() => {
      // Keep fallback models if backend models endpoint is unavailable.
    });
  }, [refreshModels]);

  const updateSettings = useCallback((nextSettings: ChatRequestSettings & { systemPrompt: string }) => {
    setSettings(nextSettings);
  }, []);

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const sendMessage = useCallback(
    async (chatId: string | null, content: string, imageDataUrl?: string | null) => {
      const text = content.trim();
      const image = imageDataUrl?.trim() ? imageDataUrl : null;
      if ((!text && !image) || stateRef.current.isLoading) {
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
        content: text || 'Изображение',
        timestamp: nowTime(),
        imageDataUrl: image,
      };
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId: targetChatId, message: userMessage } });

      if (targetChat.messages.length === 0) {
        const autoTitle = truncateTitle(text) || (image ? 'Диалог с изображением' : targetChat.title) || 'Новый чат';
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

      const currentSettings = settingsRef.current;
      const apiMessages = mapMessagesForApi([...targetChat.messages, userMessage], currentSettings.systemPrompt);

      try {
        const accessToken = await ensureToken();
        let streamed = false;
        let wasAborted = false;

        try {
          await streamChatCompletion({
            accessToken,
            messages: apiMessages,
            settings: currentSettings,
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
              settings: currentSettings,
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
      settings,
      availableModels,
      createChat,
      selectChat,
      renameChat,
      deleteChat,
      updateSettings,
      refreshModels,
      sendMessage,
      stopGenerating,
      clearError,
    }),
    [
      state,
      settings,
      availableModels,
      createChat,
      selectChat,
      renameChat,
      deleteChat,
      updateSettings,
      refreshModels,
      sendMessage,
      stopGenerating,
      clearError,
    ]
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
