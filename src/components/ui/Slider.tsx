import React from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ label, min, max, step, value, onChange }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-primary)',
        }}
      >
        <span>{label}</span>
        <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '4px',
            background: 'var(--color-border)',
            borderRadius: 'var(--border-radius-pill)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${percentage}%`,
            height: '4px',
            background: 'var(--color-accent)',
            borderRadius: 'var(--border-radius-pill)',
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            width: '100%',
            opacity: 0,
            height: '20px',
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  );
};
