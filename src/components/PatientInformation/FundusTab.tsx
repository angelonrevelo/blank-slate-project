import { Input } from '@/components/ui';
import type { FundusData } from './types';

interface FundusTabProps {
  fundus: FundusData;
  setFundus: (data: FundusData) => void;
}

export function FundusTab({ fundus, setFundus }: FundusTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground mb-4">Fundus Examination</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OD */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">OD (Right Eye)</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Examination Findings
              </label>
              <textarea
                value={fundus.od}
                onChange={(e) => setFundus({ ...fundus, od: e.target.value })}
                rows={6}
                className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                placeholder="Document fundus findings for right eye..."
              />
            </div>
            <Input
              label="Cup:Disc Ratio"
              value={fundus.cupDiscRatioOd}
              onChange={(e) => setFundus({ ...fundus, cupDiscRatioOd: e.target.value })}
              fullWidth
              size="sm"
              placeholder="e.g., 0.3"
            />
          </div>
        </div>

        {/* OS */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">OS (Left Eye)</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Examination Findings
              </label>
              <textarea
                value={fundus.os}
                onChange={(e) => setFundus({ ...fundus, os: e.target.value })}
                rows={6}
                className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                placeholder="Document fundus findings for left eye..."
              />
            </div>
            <Input
              label="Cup:Disc Ratio"
              value={fundus.cupDiscRatioOs}
              onChange={(e) => setFundus({ ...fundus, cupDiscRatioOs: e.target.value })}
              fullWidth
              size="sm"
              placeholder="e.g., 0.3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
