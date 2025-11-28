import { Input, IOLSelectionTable } from '@/components/ui';
import type { BiometryData, IOLPowersData } from './types';

interface BiometryTabProps {
  biometry: BiometryData;
  setBiometry: (data: BiometryData) => void;
  iolPowers: IOLPowersData;
  setIolPowers: (data: IOLPowersData) => void;
}

export function BiometryTab({
  biometry,
  setBiometry,
  iolPowers,
  setIolPowers,
}: BiometryTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground mb-4">Biometry Measurements</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OD Measurements */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">OD (Right Eye)</h3>
          <div className="space-y-3">
            <Input
              label="K1"
              value={biometry.odK1}
              onChange={(e) => setBiometry({ ...biometry, odK1: e.target.value })}
              fullWidth
              size="sm"
            />
            <Input
              label="K2"
              value={biometry.odK2}
              onChange={(e) => setBiometry({ ...biometry, odK2: e.target.value })}
              fullWidth
              size="sm"
            />
            <Input
              label="AL (Axial Length)"
              value={biometry.odAl}
              onChange={(e) => setBiometry({ ...biometry, odAl: e.target.value })}
              fullWidth
              size="sm"
            />
            <Input
              label="ACD (Anterior Chamber Depth)"
              value={biometry.odAcd}
              onChange={(e) => setBiometry({ ...biometry, odAcd: e.target.value })}
              fullWidth
              size="sm"
            />
          </div>
        </div>

        {/* OS Measurements */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">OS (Left Eye)</h3>
          <div className="space-y-3">
            <Input
              label="K1"
              value={biometry.osK1}
              onChange={(e) => setBiometry({ ...biometry, osK1: e.target.value })}
              fullWidth
              size="sm"
            />
            <Input
              label="K2"
              value={biometry.osK2}
              onChange={(e) => setBiometry({ ...biometry, osK2: e.target.value })}
              fullWidth
              size="sm"
            />
            <Input
              label="AL (Axial Length)"
              value={biometry.osAl}
              onChange={(e) => setBiometry({ ...biometry, osAl: e.target.value })}
              fullWidth
              size="sm"
            />
            <Input
              label="ACD (Anterior Chamber Depth)"
              value={biometry.osAcd}
              onChange={(e) => setBiometry({ ...biometry, osAcd: e.target.value })}
              fullWidth
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* IOL Power Selection */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 mt-4">
        <IOLSelectionTable initialValues={iolPowers} onChange={setIolPowers} />
      </div>
    </div>
  );
}
