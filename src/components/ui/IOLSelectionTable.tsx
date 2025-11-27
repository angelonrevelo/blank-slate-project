import { useState } from 'react';
import { Input } from './Input';

interface IOLPowers {
  OD_A1: string;
  OD_A2: string;
  OD_A3: string;
  OD_A4: string;
  OD_A5: string;
  OD_B1: string;
  OD_B2: string;
  OD_B3: string;
  OD_B4: string;
  OD_B5: string;
  OS_A1: string;
  OS_A2: string;
  OS_A3: string;
  OS_A4: string;
  OS_A5: string;
  OS_B1: string;
  OS_B2: string;
  OS_B3: string;
  OS_B4: string;
  OS_B5: string;
}

interface IOLSelectionTableProps {
  initialValues?: Partial<IOLPowers>;
  onChange?: (values: IOLPowers) => void;
  readonly?: boolean;
}

const defaultValues: IOLPowers = {
  OD_A1: '', OD_A2: '', OD_A3: '', OD_A4: '', OD_A5: '',
  OD_B1: '', OD_B2: '', OD_B3: '', OD_B4: '', OD_B5: '',
  OS_A1: '', OS_A2: '', OS_A3: '', OS_A4: '', OS_A5: '',
  OS_B1: '', OS_B2: '', OS_B3: '', OS_B4: '', OS_B5: '',
};

export function IOLSelectionTable({
  initialValues = {},
  onChange,
  readonly = false,
}: IOLSelectionTableProps) {
  const [values, setValues] = useState<IOLPowers>({
    ...defaultValues,
    ...initialValues,
  });

  const handleChange = (field: keyof IOLPowers, value: string) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    onChange?.(newValues);
  };

  const renderRow = (eye: 'OD' | 'OS', rowLabel: 'A' | 'B') => {
    return (
      <tr>
        <td className="border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground">
          {eye} {rowLabel}
        </td>
        {[1, 2, 3, 4, 5].map(num => {
          const field = `${eye}_${rowLabel}${num}` as keyof IOLPowers;
          return (
            <td key={field} className="border border-border p-1">
              <Input
                value={values[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                disabled={readonly}
                className="text-center h-10 text-sm"
                placeholder="--"
              />
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          IOL Power Selection
        </h3>
        <p className="text-sm text-muted-foreground">
          Enter IOL power options for each eye (OD = Right Eye, OS = Left Eye)
        </p>
      </div>

      <table className="w-full border-collapse border border-border bg-background rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-secondary">
            <th className="border border-border px-3 py-2 text-sm font-semibold text-foreground text-left">
              Eye
            </th>
            <th className="border border-border px-3 py-2 text-sm font-semibold text-foreground">
              Option 1
            </th>
            <th className="border border-border px-3 py-2 text-sm font-semibold text-foreground">
              Option 2
            </th>
            <th className="border border-border px-3 py-2 text-sm font-semibold text-foreground">
              Option 3
            </th>
            <th className="border border-border px-3 py-2 text-sm font-semibold text-foreground">
              Option 4
            </th>
            <th className="border border-border px-3 py-2 text-sm font-semibold text-foreground">
              Option 5
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Right Eye (OD) */}
          {renderRow('OD', 'A')}
          {renderRow('OD', 'B')}
          
          {/* Separator */}
          <tr>
            <td colSpan={6} className="h-2 bg-muted"></td>
          </tr>
          
          {/* Left Eye (OS) */}
          {renderRow('OS', 'A')}
          {renderRow('OS', 'B')}
        </tbody>
      </table>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Instructions:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Enter IOL power values in diopters (D)</li>
          <li>Row A typically represents primary IOL options</li>
          <li>Row B can be used for alternative or backup options</li>
          <li>Values are usually between 10.0D and 30.0D</li>
        </ul>
      </div>
    </div>
  );
}
