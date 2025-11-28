import { Input, Button } from '@/components/ui';
import type { VisualAcuityData } from './types';

interface VisualAcuityTabProps {
  visualAcuity: VisualAcuityData;
  setVisualAcuity: (data: VisualAcuityData) => void;
  onShowPreviousResults: () => void;
}

export function VisualAcuityTab({
  visualAcuity,
  setVisualAcuity,
  onShowPreviousResults,
}: VisualAcuityTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-foreground">Visual Acuity Examination</h2>
        <Button variant="outline" onClick={onShowPreviousResults} size="sm">
          VIEW PREVIOUS RESULTS
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OD (Right Eye) Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded">
            OD (Right Eye)
          </h3>

          {/* Visual Acuity Near - OD */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-3">
            <h4 className="text-xs font-semibold text-foreground mb-2">Visual Acuity (Near)</h4>
            <div className="space-y-2">
              <Input
                label="OD"
                value={visualAcuity.nearOd}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOd: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="BC"
                value={visualAcuity.nearOdBc}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOdBc: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="PH"
                value={visualAcuity.nearOdPh}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOdPh: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="AR"
                value={visualAcuity.nearOdAr}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOdAr: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="K1"
                value={visualAcuity.nearOdK1}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOdK1: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="K2"
                value={visualAcuity.nearOdK2}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOdK2: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="Axl Length"
                value={visualAcuity.nearOdAxl}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOdAxl: e.target.value })}
                fullWidth
                size="sm"
              />
            </div>
          </div>

          {/* Visual Acuity Distance - OD */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-3">
            <h4 className="text-xs font-semibold text-foreground mb-2">Visual Acuity (Distance)</h4>
            <div className="space-y-2">
              <Input
                label="OD"
                value={visualAcuity.distOd}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, distOd: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="BC"
                value={visualAcuity.distOdBc}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, distOdBc: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="PH"
                value={visualAcuity.distOdPh}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, distOdPh: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="K1"
                value={visualAcuity.distOdK1}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, distOdK1: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="K2"
                value={visualAcuity.distOdK2}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, distOdK2: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="Axl Length"
                value={visualAcuity.distOdAxl}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, distOdAxl: e.target.value })}
                fullWidth
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* OS (Left Eye) Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground bg-green-50 dark:bg-green-950 p-2 rounded">
            OS (Left Eye)
          </h3>

          {/* Visual Acuity Near - OS */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-3">
            <h4 className="text-xs font-semibold text-foreground mb-2">Visual Acuity (Near)</h4>
            <div className="space-y-2">
              <Input
                label="OS"
                value={visualAcuity.nearOs}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOs: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="BC"
                value={visualAcuity.nearOsBc}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOsBc: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="PH"
                value={visualAcuity.nearOsPh}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOsPh: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="AR"
                value={visualAcuity.nearOsAr}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOsAr: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="K1"
                value={visualAcuity.nearOsK1}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOsK1: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="K2"
                value={visualAcuity.nearOsK2}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOsK2: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="Axl Length"
                value={visualAcuity.nearOsAxl}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, nearOsAxl: e.target.value })}
                fullWidth
                size="sm"
              />
            </div>
          </div>

          {/* Visual Acuity Distance - OS */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-3">
            <h4 className="text-xs font-semibold text-foreground mb-2">Visual Acuity (Distance)</h4>
            <div className="space-y-2">
              <Input
                label="OS"
                value={visualAcuity.distOs}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, distOs: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="BC"
                value={visualAcuity.distOsBc}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, distOsBc: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="PH"
                value={visualAcuity.distOsPh}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, distOsPh: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="K1"
                value={visualAcuity.distOsK1}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, distOsK1: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="K2"
                value={visualAcuity.distOsK2}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, distOsK2: e.target.value })}
                fullWidth
                size="sm"
              />
              <Input
                label="Axl Length"
                value={visualAcuity.distOsAxl}
                onChange={(e) => setVisualAcuity({ ...visualAcuity, distOsAxl: e.target.value })}
                fullWidth
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
