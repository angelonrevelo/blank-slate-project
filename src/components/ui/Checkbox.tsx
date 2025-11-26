import { type InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export function Checkbox({
  label,
  error,
  className = '',
  ...props
}: CheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className={`
          h-4 w-4 rounded border-gray-300 text-primary
          focus:ring-primary focus:ring-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-error' : ''}
          ${className}
        `}
        {...props}
      />
      {label && (
        <label
          htmlFor={props.id}
          className="ml-2 text-sm text-gray-700 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
      {error && (
        <p className="ml-2 text-sm text-error">{error}</p>
      )}
    </div>
  );
}

export default Checkbox;
