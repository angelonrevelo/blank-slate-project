import { Input, FileUpload, EyeSelector } from '@/components/ui';
import type { SurgeryScheduleData } from './types';

interface ClearanceTabProps {
  surgerySchedule: SurgeryScheduleData;
  setSurgerySchedule: (data: SurgeryScheduleData) => void;
}

export function ClearanceTab({
  surgerySchedule,
  setSurgerySchedule,
}: ClearanceTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground mb-4">Medical Clearance</h2>

      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Upload Clearance Documents
        </h3>
        <FileUpload
          label="Medical Clearance Documents"
          accept=".pdf,.jpg,.jpeg,.png"
          onFileSelect={(file) => console.log('File selected:', file)}
        />

        <div className="mt-4">
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Clearance Notes
          </label>
          <textarea
            rows={4}
            className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
            placeholder="Additional clearance notes..."
          />
        </div>
      </div>

      {/* Surgery Scheduling */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Surgery Scheduling</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              type="date"
              label="Scheduled Date"
              value={surgerySchedule.scheduledDate}
              onChange={(e) =>
                setSurgerySchedule({ ...surgerySchedule, scheduledDate: e.target.value })
              }
              fullWidth
              size="sm"
            />
            <Input
              type="time"
              label="Scheduled Time"
              value={surgerySchedule.scheduledTime}
              onChange={(e) =>
                setSurgerySchedule({ ...surgerySchedule, scheduledTime: e.target.value })
              }
              fullWidth
              size="sm"
            />
          </div>
          <Input
            label="Procedure"
            value={surgerySchedule.procedure}
            onChange={(e) =>
              setSurgerySchedule({ ...surgerySchedule, procedure: e.target.value })
            }
            fullWidth
            size="sm"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <EyeSelector
              value={surgerySchedule.eyeOperated}
              onChange={(value) =>
                setSurgerySchedule({ ...surgerySchedule, eyeOperated: value })
              }
              label="Eye to be Operated"
            />
            <Input
              label="IOL Power"
              value={surgerySchedule.iolPower}
              onChange={(e) =>
                setSurgerySchedule({ ...surgerySchedule, iolPower: e.target.value })
              }
              fullWidth
              size="sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Surgery Notes
            </label>
            <textarea
              value={surgerySchedule.notes}
              onChange={(e) =>
                setSurgerySchedule({ ...surgerySchedule, notes: e.target.value })
              }
              rows={3}
              className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
              placeholder="Additional notes..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
