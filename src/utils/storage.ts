import type { ChatState } from '../types/chat';

const CHAT_STORAGE_KEY = 'gigachat-chat-state-v1';

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const loadChatState = (): ChatState | null => {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed)) return null;
    if (!Array.isArray(parsed.chats)) return null;
    if (typeof parsed.isLoading !== 'boolean') return null;
    if (!(typeof parsed.activeChatId === 'string' || parsed.activeChatId === null)) return null;
    if (!(typeof parsed.error === 'string' || parsed.error === null)) return null;

    return {
      chats: parsed.chats as ChatState['chats'],
      activeChatId: parsed.activeChatId as ChatState['activeChatId'],
      isLoading: parsed.isLoading as ChatState['isLoading'],
      error: parsed.error as ChatState['error'],
    };
  } catch {
    return null;
  }
};

export const saveChatState = (state: ChatState) => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota and private mode errors.
  }
};
