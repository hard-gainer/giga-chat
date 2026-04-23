import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import styles from './InputArea.module.css';

interface InputAreaProps {
  onSend: (text: string, imageDataUrl?: string | null) => void;
  isLoading?: boolean;
  onStop?: () => void;
}

const MAX_IMAGE_BYTES = 300 * 1024;
const MAX_SOURCE_FILE_BYTES = 12 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1280;

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Не удалось прочитать файл изображения.'));
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл изображения.'));
    reader.readAsDataURL(file);
  });

const loadImage = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Не удалось обработать изображение.'));
    image.src = dataUrl;
  });

const dataUrlSizeInBytes = (dataUrl: string) => {
  const base64 = dataUrl.split(',')[1] ?? '';
  const padding = (base64.match(/=+$/)?.[0].length ?? 0);
  return Math.floor((base64.length * 3) / 4) - padding;
};

const fitToBounds = (width: number, height: number, maxDimension: number) => {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const ratio = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
};

const compressImageForRequest = async (file: File): Promise<string> => {
  if (file.size > MAX_SOURCE_FILE_BYTES) {
    throw new Error('Файл слишком большой. Выберите изображение до 12MB.');
  }

  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);
  const fitted = fitToBounds(image.width, image.height, MAX_IMAGE_DIMENSION);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Не удалось обработать изображение в браузере.');
  }

  let scale = 1;
  let quality = 0.84;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const targetWidth = Math.max(320, Math.round(fitted.width * scale));
    const targetHeight = Math.max(320, Math.round(fitted.height * scale));
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // JPEG does not support transparency, so draw on white background.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const encoded = canvas.toDataURL('image/jpeg', quality);
    if (dataUrlSizeInBytes(encoded) <= MAX_IMAGE_BYTES) {
      return encoded;
    }

    if (quality > 0.52) {
      quality -= 0.08;
    } else {
      scale *= 0.82;
    }
  }

  throw new Error('Изображение слишком большое даже после сжатия. Попробуйте файл меньшего размера.');
};

export const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  isLoading = false,
  onStop,
}) => {
  const [value, setValue] = useState('');
  const [imagePreview, setImagePreview] = useState<{ name: string; dataUrl: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_ROWS = 5;
  const LINE_HEIGHT = 22;

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const maxHeight = MAX_ROWS * LINE_HEIGHT + 20;
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px';
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed && !imagePreview) return;

    if (imagePreview?.dataUrl) {
      onSend(trimmed, imagePreview.dataUrl);
    } else {
      onSend(trimmed);
    }

    setValue('');
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAttachImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Можно прикрепить только изображение (JPG, PNG, WEBP).');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setImageError(null);

    try {
      const compressedDataUrl = await compressImageForRequest(file);
      setImagePreview({ name: file.name, dataUrl: compressedDataUrl });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось подготовить изображение.';
      setImageError(message);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const canSend = Boolean(value.trim() || imagePreview);

  return (
    <div className={styles.container}>
      {imagePreview && (
        <div className={styles.previewBar}>
          <img src={imagePreview.dataUrl} alt={imagePreview.name} className={styles.previewImage} />
          <span className={styles.previewName}>{imagePreview.name}</span>
          <Button
            variant="icon"
            title="Убрать изображение"
            onClick={() => {
              setImagePreview(null);
              setImageError(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className={styles.previewRemoveBtn}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
      )}

      <div className={styles.box}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          hidden
        />

        {/* Attach image button */}
        <Button
          variant="icon"
          title="Прикрепить изображение"
          className={styles.attachBtn}
          disabled={isLoading}
          onClick={handleAttachImage}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </Button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isLoading
              ? 'Ассистент печатает...'
              : 'Напишите сообщение... (Enter — отправить, Shift+Enter — новая строка)'
          }
          rows={1}
          disabled={isLoading}
          className={styles.textarea}
        />

        {isLoading ? (
          <Button
            variant="icon"
            title="Остановить генерацию"
            onClick={onStop}
            className={`${styles.stopBtn} ${styles.sendBtn}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </Button>
        ) : (
          <Button
            variant={canSend ? 'primary' : 'ghost'}
            title="Отправить"
            onClick={handleSend}
            disabled={!canSend}
            className={`${styles.sendBtn} ${!canSend ? styles.sendBtnDisabled : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </Button>
        )}
      </div>

      <p className={styles.hint}>
        GigaChat может совершать ошибки. Проверяйте важную информацию.
      </p>
      {imageError && (
        <div className={styles.errorWrap}>
          <ErrorMessage message={imageError} />
        </div>
      )}
    </div>
  );
};
