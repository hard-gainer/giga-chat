export type Scope = 'GIGACHAT_API_PERS' | 'GIGACHAT_API_B2B' | 'GIGACHAT_API_CORP';

export interface GigaChatAuthConfig {
  credentials: string;
  scope: Scope;
}

export interface GigaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OAuthResponse {
  access_token: string;
  expires_at: number;
}

interface CompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const AUTH_URL =
  import.meta.env.VITE_GIGACHAT_AUTH_URL ?? '/proxy/gigachat/oauth';
const API_URL =
  import.meta.env.VITE_GIGACHAT_API_URL ?? '/proxy/gigachat/chat/completions';

export const requestAccessToken = async (auth: GigaChatAuthConfig): Promise<OAuthResponse> => {
  const body = new URLSearchParams({ scope: auth.scope });

  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth.credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      RqUID: crypto.randomUUID(),
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `OAuth error: ${response.status}`);
  }

  const data = (await response.json()) as OAuthResponse;
  if (!data.access_token) {
    throw new Error('Не удалось получить access token.');
  }

  return data;
};

export const createChatCompletion = async (params: {
  accessToken: string;
  messages: GigaChatMessage[];
  signal?: AbortSignal;
}): Promise<string> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'GigaChat',
      messages: params.messages,
      stream: false,
    }),
    signal: params.signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Completion error: ${response.status}`);
  }

  const data = (await response.json()) as CompletionResponse;
  return data.choices?.[0]?.message?.content?.trim() || 'Пустой ответ от API.';
};

const parseSseChunk = (chunk: string): string => {
  const lines = chunk.split('\n');
  let content = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.startsWith('data:')) continue;

    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;

    try {
      const parsed = JSON.parse(payload) as {
        choices?: Array<{
          delta?: { content?: string };
          message?: { content?: string };
        }>;
      };
      const token = parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content ?? '';
      if (token) content += token;
    } catch {
      // Ignore malformed partial chunks.
    }
  }

  return content;
};

export const streamChatCompletion = async (params: {
  accessToken: string;
  messages: GigaChatMessage[];
  signal?: AbortSignal;
  onToken: (token: string) => void;
}): Promise<void> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      model: 'GigaChat',
      messages: params.messages,
      stream: true,
    }),
    signal: params.signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Stream error: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Streaming не поддерживается ответом сервера.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const textChunk = decoder.decode(value, { stream: true });
    const token = parseSseChunk(textChunk);
    if (token) params.onToken(token);
  }
};
