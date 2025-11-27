import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, fullWidth, options, className = '', id, ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
        )}
        
        <select
          id={id}
          ref={ref}
          className={`
            w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:bg-muted disabled:cursor-not-allowed
            ${error ? 'border-error' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
