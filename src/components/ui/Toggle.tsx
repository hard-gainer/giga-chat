import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-primary)',
      }}
    >
      <span
        onClick={() => onChange(!checked)}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '44px',
          height: '24px',
          background: checked ? 'var(--color-accent)' : 'var(--color-border)',
          borderRadius: 'var(--border-radius-pill)',
          transition: 'background var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: checked ? '23px' : '3px',
            width: '18px',
            height: '18px',
            background: '#ffffff',
            borderRadius: '50%',
            transition: 'left var(--transition-fast)',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
};
