export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  imageDataUrl?: string | null;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  error: string | null;
}

export type ChatAction =
  | { type: 'HYDRATE'; payload: ChatState }
  | { type: 'CREATE_CHAT'; payload?: Chat }
  | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
  | { type: 'RENAME_CHAT'; payload: { chatId: string; title: string } }
  | { type: 'DELETE_CHAT'; payload: { chatId: string } }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'APPEND_TO_MESSAGE'; payload: { chatId: string; messageId: string; chunk: string } }
  | { type: 'SET_MESSAGE_CONTENT'; payload: { chatId: string; messageId: string; content: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
