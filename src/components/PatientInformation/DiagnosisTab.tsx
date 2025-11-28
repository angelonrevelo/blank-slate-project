import { Input, EyeSelector } from '@/components/ui';
import type { DiagnosisData } from './types';

interface DiagnosisTabProps {
  diagnosis: DiagnosisData;
  setDiagnosis: (data: DiagnosisData) => void;
}

export function DiagnosisTab({ diagnosis, setDiagnosis }: DiagnosisTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground mb-4">Diagnosis</h2>

      {/* Pseudophakia */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={diagnosis.pseudophakia}
            onChange={(e) => setDiagnosis({ ...diagnosis, pseudophakia: e.target.checked })}
            className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
          />
          <h3 className="text-sm font-semibold text-foreground">Pseudophakia</h3>
        </div>
        {diagnosis.pseudophakia && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
            <EyeSelector
              value={diagnosis.pseudophakiaLaterality}
              onChange={(value) =>
                setDiagnosis({ ...diagnosis, pseudophakiaLaterality: value })
              }
              label="Affected Eye"
            />
            <Input
              label="IOL Details"
              value={diagnosis.pseudophakiaIol}
              onChange={(e) => setDiagnosis({ ...diagnosis, pseudophakiaIol: e.target.value })}
              fullWidth
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Cataract */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={diagnosis.cataract}
            onChange={(e) => setDiagnosis({ ...diagnosis, cataract: e.target.checked })}
            className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
          />
          <h3 className="text-sm font-semibold text-foreground">Cataract</h3>
        </div>
        {diagnosis.cataract && (
          <div className="space-y-3 pl-7">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(diagnosis.cataractType).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        setDiagnosis({
                          ...diagnosis,
                          cataractType: { ...diagnosis.cataractType, [key]: e.target.checked },
                        })
                      }
                      className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                    />
                    <span className="text-xs text-foreground capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>
            <EyeSelector
              value={diagnosis.cataractLaterality}
              onChange={(value) =>
                setDiagnosis({ ...diagnosis, cataractLaterality: value })
              }
              label="Affected Eye"
            />
          </div>
        )}
      </div>

      {/* Pterygium */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={diagnosis.pterygium}
            onChange={(e) => setDiagnosis({ ...diagnosis, pterygium: e.target.checked })}
            className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
          />
          <h3 className="text-sm font-semibold text-foreground">Pterygium</h3>
        </div>
        {diagnosis.pterygium && (
          <div className="pl-7">
            <EyeSelector
              value={diagnosis.pterygiumLaterality}
              onChange={(value) =>
                setDiagnosis({ ...diagnosis, pterygiumLaterality: value })
              }
              label="Affected Eye"
            />
          </div>
        )}
      </div>

      {/* Refraction Error */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={diagnosis.refractionError}
            onChange={(e) => setDiagnosis({ ...diagnosis, refractionError: e.target.checked })}
            className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
          />
          <h3 className="text-sm font-semibold text-foreground">Refraction Error</h3>
        </div>
        {diagnosis.refractionError && (
          <div className="space-y-3 pl-7">
            <EyeSelector
              value={diagnosis.refractionLaterality}
              onChange={(value) =>
                setDiagnosis({ ...diagnosis, refractionLaterality: value })
              }
              label="Affected Eye"
            />
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Notes</label>
              <textarea
                value={diagnosis.refractionNotes}
                onChange={(e) => setDiagnosis({ ...diagnosis, refractionNotes: e.target.value })}
                rows={3}
                className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Other Diagnosis */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={diagnosis.other}
            onChange={(e) => setDiagnosis({ ...diagnosis, other: e.target.checked })}
            className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
          />
          <h3 className="text-sm font-semibold text-foreground">Other Diagnosis</h3>
        </div>
        {diagnosis.other && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
            <Input
              label="Diagnosis"
              value={diagnosis.otherDiagnosis}
              onChange={(e) => setDiagnosis({ ...diagnosis, otherDiagnosis: e.target.value })}
              fullWidth
              size="sm"
            />
            <EyeSelector
              value={diagnosis.otherLaterality}
              onChange={(value) => setDiagnosis({ ...diagnosis, otherLaterality: value })}
              label="Affected Eye"
            />
          </div>
        )}
      </div>
    </div>
  );
}
