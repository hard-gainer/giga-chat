import { chatReducer, DEFAULT_CHAT_STATE } from './chatReducer';
import type { Chat, ChatState, Message } from '../types/chat';

const makeMessage = (id: string, content: string): Message => ({
  id,
  role: 'user',
  content,
  timestamp: '10:00',
});

const makeChat = (id: string, title: string, messages: Message[] = []): Chat => ({
  id,
  title,
  createdAt: '2026-01-01T10:00:00.000Z',
  updatedAt: '2026-01-01T10:00:00.000Z',
  messages,
});

describe('chatReducer', () => {
  it('ADD_MESSAGE adds new message to the end of messages array', () => {
    const initial: ChatState = {
      ...DEFAULT_CHAT_STATE,
      chats: [makeChat('chat-1', 'First', [makeMessage('m1', 'Hello')])],
      activeChatId: 'chat-1',
    };

    const nextMessage = makeMessage('m2', 'World');
    const next = chatReducer(initial, {
      type: 'ADD_MESSAGE',
      payload: { chatId: 'chat-1', message: nextMessage },
    });

    expect(next.chats[0].messages).toHaveLength(2);
    expect(next.chats[0].messages[1]).toEqual(nextMessage);
  });

  it('CREATE_CHAT creates new chat with unique id and puts it into chats array', () => {
    const randomUuidSpy = vi
      .spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValueOnce('11111111-1111-1111-1111-111111111111')
      .mockReturnValueOnce('22222222-2222-2222-2222-222222222222');

    const withFirst = chatReducer(DEFAULT_CHAT_STATE, { type: 'CREATE_CHAT' });
    const withSecond = chatReducer(withFirst, { type: 'CREATE_CHAT' });

    expect(withFirst.chats).toHaveLength(1);
    expect(withSecond.chats).toHaveLength(2);
    expect(withFirst.chats[0].id).toBe('11111111-1111-1111-1111-111111111111');
    expect(withSecond.chats[0].id).toBe('22222222-2222-2222-2222-222222222222');
    expect(withSecond.chats[0].id).not.toBe(withSecond.chats[1].id);

    randomUuidSpy.mockRestore();
  });

  it('DELETE_CHAT removes chat and resets activeChatId when active chat deleted', () => {
    const initial: ChatState = {
      ...DEFAULT_CHAT_STATE,
      chats: [makeChat('chat-1', 'First'), makeChat('chat-2', 'Second')],
      activeChatId: 'chat-1',
    };

    const next = chatReducer(initial, {
      type: 'DELETE_CHAT',
      payload: { chatId: 'chat-1' },
    });

    expect(next.chats).toHaveLength(1);
    expect(next.chats[0].id).toBe('chat-2');
    expect(next.activeChatId).toBe('chat-2');
  });

  it('RENAME_CHAT updates title by chat id', () => {
    const initial: ChatState = {
      ...DEFAULT_CHAT_STATE,
      chats: [makeChat('chat-1', 'Old title')],
      activeChatId: 'chat-1',
    };

    const next = chatReducer(initial, {
      type: 'RENAME_CHAT',
      payload: { chatId: 'chat-1', title: 'New title' },
    });

    expect(next.chats[0].title).toBe('New title');
  });
});
