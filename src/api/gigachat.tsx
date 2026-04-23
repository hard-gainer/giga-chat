export type Scope = 'GIGACHAT_API_PERS' | 'GIGACHAT_API_B2B' | 'GIGACHAT_API_CORP';

export interface GigaChatAuthConfig {
  credentials: string;
  scope: Scope;
}

export interface GigaChatContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface GigaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | GigaChatContentPart[];
}

export interface ChatRequestSettings {
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  repetitionPenalty: number;
}

interface ModelsResponse {
  data?: Array<{
    id?: string;
    name?: string;
  }>;
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
const MODELS_URL =
  import.meta.env.VITE_GIGACHAT_MODELS_URL ?? '/proxy/gigachat/models';

const containsNonIso88591 = (value: string) => {
  for (const char of value) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (codePoint > 255) return true;
  }
  return false;
};

const toUtf8Base64 = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

const normalizeBasicCredentials = (credentials: string) => {
  let value = credentials.trim();
  if (/^basic\s+/i.test(value)) {
    value = value.replace(/^basic\s+/i, '').trim();
  }

  if (!value) {
    throw new Error('Credentials не заданы.');
  }

  const isBase64 = /^[A-Za-z0-9+/=]+$/.test(value);
  if (!isBase64) {
    value = toUtf8Base64(value);
  }

  if (containsNonIso88591(value)) {
    throw new Error('Credentials содержат недопустимые символы для HTTP-заголовков.');
  }

  return value;
};

const normalizeAccessToken = (token: string) => {
  const value = token.trim();
  if (!value) {
    throw new Error('Пустой access token. Повторите авторизацию.');
  }

  if (containsNonIso88591(value)) {
    throw new Error('Access token содержит недопустимые символы для HTTP-заголовков. Повторите авторизацию.');
  }

  return value;
};

const buildBearerHeader = (accessToken: string) => `Bearer ${normalizeAccessToken(accessToken)}`;

const formatRequestError = async (response: Response, fallbackPrefix: string) => {
  if (response.status === 413) {
    return 'Запрос слишком большой. Уменьшите изображение или сократите историю чата и попробуйте снова.';
  }

  const text = await response.text();
  return text || `${fallbackPrefix}: ${response.status}`;
};

const toApiConfig = (config: ChatRequestSettings) => ({
  model: config.model,
  temperature: config.temperature,
  top_p: config.topP,
  max_tokens: config.maxTokens,
  repetition_penalty: config.repetitionPenalty,
});

export const requestAccessToken = async (auth: GigaChatAuthConfig): Promise<OAuthResponse> => {
  const normalizedCredentials = normalizeBasicCredentials(auth.credentials);
  const body = new URLSearchParams({ scope: auth.scope });

  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${normalizedCredentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      RqUID: crypto.randomUUID(),
    },
    body,
  });

  if (!response.ok) {
    const message = await formatRequestError(response, 'OAuth error');
    throw new Error(message);
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
  settings: ChatRequestSettings;
  signal?: AbortSignal;
}): Promise<string> => {
  const authorization = buildBearerHeader(params.accessToken);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      ...toApiConfig(params.settings),
      messages: params.messages,
      stream: false,
    }),
    signal: params.signal,
  });

  if (!response.ok) {
    const message = await formatRequestError(response, 'Completion error');
    throw new Error(message);
  }

  const data = (await response.json()) as CompletionResponse;
  return data.choices?.[0]?.message?.content?.trim() || 'Пустой ответ от API.';
};

const parseSseEvent = (eventChunk: string): string => {
  const lines = eventChunk.split('\n');
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
  settings: ChatRequestSettings;
  signal?: AbortSignal;
  onToken: (token: string) => void;
}): Promise<void> => {
  const authorization = buildBearerHeader(params.accessToken);
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      ...toApiConfig(params.settings),
      messages: params.messages,
      stream: true,
    }),
    signal: params.signal,
  });

  if (!response.ok) {
    const message = await formatRequestError(response, 'Stream error');
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error('Streaming не поддерживается ответом сервера.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    pending += decoder.decode(value, { stream: true });
    const events = pending.split('\n\n');
    pending = events.pop() ?? '';

    for (const eventChunk of events) {
      const token = parseSseEvent(eventChunk);
      if (token) params.onToken(token);
    }
  }

  pending += decoder.decode();
  if (pending.trim()) {
    const token = parseSseEvent(pending);
    if (token) params.onToken(token);
  }
};

export const getAvailableModels = async (params: { accessToken: string }): Promise<string[]> => {
  const authorization = buildBearerHeader(params.accessToken);
  const response = await fetch(MODELS_URL, {
    method: 'GET',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const message = await formatRequestError(response, 'Models error');
    throw new Error(message);
  }

  const payload = (await response.json()) as ModelsResponse;
  const models = payload.data
    ?.map((item) => item.id ?? item.name ?? '')
    .filter((model): model is string => Boolean(model.trim()));

  return models ?? [];
};
