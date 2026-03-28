import React from 'react';
import styles from './Toggle.module.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <label className={styles.label}>
      <button
        type="button"
        className={`${styles.track} ${checked ? styles.trackOn : ''}`}
        aria-pressed={checked}
        aria-label={label ?? 'Переключить тему'}
        onClick={() => onChange(!checked)}
      >
        <span className={`${styles.thumb} ${checked ? styles.thumbOn : ''}`} />
      </button>
      {label && <span>{label}</span>}
    </label>
  );
};
