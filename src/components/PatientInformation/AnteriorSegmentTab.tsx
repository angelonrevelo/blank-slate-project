import { ImagePainter } from '@/components/ui';
import type { AnteriorSegmentData } from './types';

interface AnteriorSegmentTabProps {
  anteriorSegment: AnteriorSegmentData;
  setAnteriorSegment: (data: AnteriorSegmentData) => void;
}

export function AnteriorSegmentTab({
  anteriorSegment,
  setAnteriorSegment,
}: AnteriorSegmentTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground mb-4">Anterior Segment</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OD Drawing */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">OD (Right Eye)</h3>
          <ImagePainter
            backgroundImage={anteriorSegment.odDrawing}
            onSave={(pngUrl) =>
              setAnteriorSegment({ ...anteriorSegment, odDrawing: pngUrl })
            }
          />
        </div>

        {/* OS Drawing */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">OS (Left Eye)</h3>
          <ImagePainter
            backgroundImage={anteriorSegment.osDrawing}
            onSave={(pngUrl) =>
              setAnteriorSegment({ ...anteriorSegment, osDrawing: pngUrl })
            }
          />
        </div>
      </div>
    </div>
  );
}
