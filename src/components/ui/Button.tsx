import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontFamily: 'var(--font-family)',
    fontWeight: 500,
    border: 'none',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    transition: 'background var(--transition-fast), opacity var(--transition-fast)',
    whiteSpace: 'nowrap',
    outline: 'none',
  },
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-accent)',
    color: '#fff',
  },
  secondary: {
    background: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
  },
  danger: {
    background: 'var(--color-danger)',
    color: '#fff',
  },
  icon: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    borderRadius: 'var(--border-radius-pill)',
    padding: '6px',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { fontSize: 'var(--font-size-sm)', padding: '5px 10px', height: '30px' },
  md: { fontSize: 'var(--font-size-md)', padding: '8px 16px', height: '38px' },
  lg: { fontSize: 'var(--font-size-lg)', padding: '10px 24px', height: '46px' },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  style,
  disabled,
  ...rest
}) => {
  return (
    <button
      style={{
        ...styles.base,
        ...variantStyles[variant],
        ...(variant !== 'icon' ? sizeStyles[size] : {}),
        ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
        ...style,
      }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};
