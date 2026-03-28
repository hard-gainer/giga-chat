import React from 'react';
import styles from './AssistantAvatar.module.css';

export const AssistantAvatar: React.FC = () => (
  <div className={styles.avatar}>
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  </div>
);
