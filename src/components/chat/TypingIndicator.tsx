import React from 'react';
import { AssistantAvatar } from '../ui/AssistantAvatar';
import styles from './TypingIndicator.module.css';

interface TypingIndicatorProps {
  isVisible?: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.root}>
      <AssistantAvatar />

      {/* Bubble */}
      <div className={styles.content}>
        <div className={styles.sender}>
          GigaChat
        </div>
        <div className={styles.bubble}>
          <span className={styles.dot} />
          <span className={`${styles.dot} ${styles.dot2}`} />
          <span className={`${styles.dot} ${styles.dot3}`} />
        </div>
      </div>
    </div>
  );
};
