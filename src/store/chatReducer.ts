import type { Chat, ChatAction, ChatState } from '../types/chat';

export const DEFAULT_CHAT_STATE: ChatState = {
  chats: [],
  activeChatId: null,
  isLoading: false,
  error: null,
};

const makeDialogTitle = (state: ChatState) => `Диалог ${state.chats.length + 1}`;

const makeGeneratedChat = (state: ChatState): Chat => {
  const timestamp = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: makeDialogTitle(state),
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [],
  };
};

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'CREATE_CHAT': {
      const chat = action.payload ?? makeGeneratedChat(state);
      return {
        ...state,
        chats: [chat, ...state.chats],
        activeChatId: chat.id,
      };
    }
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
