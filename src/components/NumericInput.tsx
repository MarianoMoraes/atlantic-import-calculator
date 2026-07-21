import { useEffect, useRef, useState } from 'react';
import { editableNumber, formatNumber, parseLocaleNumber } from '../lib/format';

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
  ariaLabel: string;
  selectOnFocus?: boolean;
}

export function NumericInput({
  value,
  onChange,
  className = '',
  disabled = false,
  ariaLabel,
  selectOnFocus = true,
}: NumericInputProps) {
  const [draft, setDraft] = useState(formatNumber(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(formatNumber(value));
  }, [value]);

  return (
    <input
      aria-label={ariaLabel}
      className={`numeric-input ${className}`}
      disabled={disabled}
      inputMode="decimal"
      value={draft}
      onFocus={(event) => {
        focused.current = true;
        setDraft(editableNumber(value));
        if (selectOnFocus) event.currentTarget.select();
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        focused.current = false;
        const parsed = parseLocaleNumber(draft);
        onChange(parsed);
        setDraft(formatNumber(parsed));
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
        if (event.key === 'Escape') {
          setDraft(formatNumber(value));
          event.currentTarget.blur();
        }
      }}
    />
  );
}
