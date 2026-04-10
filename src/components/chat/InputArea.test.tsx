import { fireEvent, render, screen } from '@testing-library/react';
import { InputArea } from './InputArea';

describe('InputArea', () => {
  it('calls onSend with text when send button clicked and input is not empty', () => {
    const onSend = vi.fn();
    render(<InputArea onSend={onSend} />);

    const textarea = screen.getByPlaceholderText(/Напишите сообщение/i);
    fireEvent.change(textarea, { target: { value: '  Привет!  ' } });

    fireEvent.click(screen.getByTitle('Отправить'));

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith('Привет!');
  });

  it('calls onSend on Enter with non-empty input', () => {
    const onSend = vi.fn();
    render(<InputArea onSend={onSend} />);

    const textarea = screen.getByPlaceholderText(/Напишите сообщение/i);
    fireEvent.change(textarea, { target: { value: 'Текст для Enter' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith('Текст для Enter');
  });

  it('send button is disabled when input is empty', () => {
    render(<InputArea onSend={vi.fn()} />);

    expect(screen.getByTitle('Отправить')).toBeDisabled();
  });
});
