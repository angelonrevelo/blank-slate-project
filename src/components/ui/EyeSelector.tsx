interface EyeSelectorProps {
  value: 'OD' | 'OS' | 'OU' | '';
  onChange: (value: 'OD' | 'OS' | 'OU') => void;
  label?: string;
  required?: boolean;
}

export function EyeSelector({ value, onChange, label, required }: EyeSelectorProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as 'OD' | 'OS' | 'OU')}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Select Eye</option>
        <option value="OD">OD (Right Eye)</option>
        <option value="OS">OS (Left Eye)</option>
        <option value="OU">OU (Both Eyes)</option>
      </select>
    </div>
  );
}
