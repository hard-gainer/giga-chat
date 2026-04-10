import type { ChatState } from '../types/chat';
import { loadChatState, saveChatState } from './storage';

const STORAGE_KEY = 'gigachat-chat-state-v1';

describe('storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves state to localStorage on state changes', () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem,
    });

    const state: ChatState = {
      chats: [],
      activeChatId: null,
      isLoading: false,
      error: null,
    };

    saveChatState(state);

    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(state));
  });

  it('restores state from localStorage on initialization', () => {
    const persisted: ChatState = {
      chats: [
        {
          id: 'chat-1',
          title: 'Persisted',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          messages: [],
        },
      ],
      activeChatId: 'chat-1',
      isLoading: false,
      error: null,
    };

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => JSON.stringify(persisted)),
      setItem: vi.fn(),
    });

    expect(loadChatState()).toEqual(persisted);
  });

  it('returns null for invalid JSON and does not crash', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => '{broken-json'),
      setItem: vi.fn(),
    });

    expect(loadChatState()).toBeNull();
  });
});
