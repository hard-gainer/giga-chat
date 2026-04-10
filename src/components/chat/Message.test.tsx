import { render, screen } from '@testing-library/react';
import { Message } from './Message';
import type { Message as ChatMessage } from '../../types/chat';

const baseMessage: ChatMessage = {
  id: 'm1',
  role: 'user',
  content: 'Тестовое сообщение',
  timestamp: '10:00',
};

describe('Message', () => {
  it('renders user message text and applies user class for variant user', () => {
    const { container } = render(<Message message={baseMessage} variant="user" />);

    expect(screen.getByText('Тестовое сообщение')).toBeInTheDocument();
    expect(container.firstElementChild?.className).toMatch(/user/);
    expect(screen.queryByTitle('Копировать')).not.toBeInTheDocument();
  });

  it('renders assistant message text and applies assistant class for variant assistant', () => {
    const { container } = render(
      <Message
        message={{ ...baseMessage, id: 'm2', role: 'assistant', content: 'Ответ ассистента' }}
        variant="assistant"
      />
    );

    expect(screen.getByText('Ответ ассистента')).toBeInTheDocument();
    expect(container.firstElementChild?.className).toMatch(/assistant/);
    expect(screen.getByTitle('Копировать')).toBeInTheDocument();
  });
});
