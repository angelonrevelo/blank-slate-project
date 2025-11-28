import { EyeSelector, Input } from '@/components/ui';
import type { TreatmentPlanData } from './types';

interface TreatmentPlanTabProps {
  treatmentPlan: TreatmentPlanData;
  setTreatmentPlan: (data: TreatmentPlanData) => void;
}

export function TreatmentPlanTab({
  treatmentPlan,
  setTreatmentPlan,
}: TreatmentPlanTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground mb-4">Treatment Plan</h2>

      {/* For Biometry */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={treatmentPlan.forbiometry}
            onChange={(e) =>
              setTreatmentPlan({ ...treatmentPlan, forbiometry: e.target.checked })
            }
            className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
          />
          <h3 className="text-sm font-semibold text-foreground">For Biometry Test</h3>
        </div>
        {treatmentPlan.forbiometry && (
          <div className="pl-7">
            <textarea
              value={treatmentPlan.forbiometryNotes}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, forbiometryNotes: e.target.value })
              }
              rows={3}
              className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
              placeholder="Notes for biometry test..."
            />
          </div>
        )}
      </div>

      {/* For VA */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={treatmentPlan.forva}
            onChange={(e) =>
              setTreatmentPlan({ ...treatmentPlan, forva: e.target.checked })
            }
            className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
          />
          <h3 className="text-sm font-semibold text-foreground">For Visual Acuity Retest</h3>
        </div>
        {treatmentPlan.forva && (
          <div className="pl-7">
            <textarea
              value={treatmentPlan.forvaNotes}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, forvaNotes: e.target.value })
              }
              rows={3}
              className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
              placeholder="Notes for VA retest..."
            />
          </div>
        )}
      </div>

      {/* For Surgery */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={treatmentPlan.forsurgery}
            onChange={(e) =>
              setTreatmentPlan({ ...treatmentPlan, forsurgery: e.target.checked })
            }
            className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
          />
          <h3 className="text-sm font-semibold text-foreground">For Surgery</h3>
        </div>
        {treatmentPlan.forsurgery && (
          <div className="space-y-3 pl-7">
            <EyeSelector
              value={treatmentPlan.surgeryEye}
              onChange={(value) =>
                setTreatmentPlan({ ...treatmentPlan, surgeryEye: value })
              }
              label="Surgery Eye"
            />
            <textarea
              value={treatmentPlan.forsurgeryNotes}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, forsurgeryNotes: e.target.value })
              }
              rows={3}
              className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
              placeholder="Surgery notes..."
            />
          </div>
        )}
      </div>

      {/* Postpone Surgery */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={treatmentPlan.postponesurgery}
            onChange={(e) =>
              setTreatmentPlan({ ...treatmentPlan, postponesurgery: e.target.checked })
            }
            className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
          />
          <h3 className="text-sm font-semibold text-foreground">Postpone Surgery</h3>
        </div>
        {treatmentPlan.postponesurgery && (
          <div className="space-y-3 pl-7">
            <Input
              type="date"
              label="Postpone Until"
              value={treatmentPlan.postponeDate}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, postponeDate: e.target.value })
              }
              fullWidth
              size="sm"
            />
            <textarea
              value={treatmentPlan.postponeNotes}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, postponeNotes: e.target.value })
              }
              rows={3}
              className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
              placeholder="Reason for postponement..."
            />
          </div>
        )}
      </div>

      {/* Refer to Specialist */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={treatmentPlan.torefer}
            onChange={(e) =>
              setTreatmentPlan({ ...treatmentPlan, torefer: e.target.checked })
            }
            className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
          />
          <h3 className="text-sm font-semibold text-foreground">Refer to Specialist</h3>
        </div>
        {treatmentPlan.torefer && (
          <div className="space-y-3 pl-7">
            <Input
              label="Referring Doctor"
              value={treatmentPlan.referDoctor}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, referDoctor: e.target.value })
              }
              fullWidth
              size="sm"
            />
            <textarea
              value={treatmentPlan.referNotes}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, referNotes: e.target.value })
              }
              rows={3}
              className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
              placeholder="Reason for referral..."
            />
          </div>
        )}
      </div>

      {/* Graduated */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={treatmentPlan.graduated}
            onChange={(e) =>
              setTreatmentPlan({ ...treatmentPlan, graduated: e.target.checked })
            }
            className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
          />
          <h3 className="text-sm font-semibold text-foreground">Treatment Complete (Graduated)</h3>
        </div>
        {treatmentPlan.graduated && (
          <div className="pl-7">
            <textarea
              value={treatmentPlan.graduatedNotes}
              onChange={(e) =>
                setTreatmentPlan({ ...treatmentPlan, graduatedNotes: e.target.value })
              }
              rows={3}
              className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
              placeholder="Treatment completion notes..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
