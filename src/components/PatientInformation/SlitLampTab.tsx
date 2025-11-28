import type { SlitLampData } from './types';

interface SlitLampTabProps {
  slitLamp: SlitLampData;
  setSlitLamp: (data: SlitLampData) => void;
}

export function SlitLampTab({ slitLamp, setSlitLamp }: SlitLampTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground mb-4">Slit Lamp Examination</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OD */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">OD (Right Eye)</h3>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Examination Findings
            </label>
            <textarea
              value={slitLamp.od}
              onChange={(e) => setSlitLamp({ ...slitLamp, od: e.target.value })}
              rows={8}
              className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
              placeholder="Document slit lamp findings for right eye..."
            />
          </div>
        </div>

        {/* OS */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">OS (Left Eye)</h3>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Examination Findings
            </label>
            <textarea
              value={slitLamp.os}
              onChange={(e) => setSlitLamp({ ...slitLamp, os: e.target.value })}
              rows={8}
              className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
              placeholder="Document slit lamp findings for left eye..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
