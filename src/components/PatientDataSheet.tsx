import type { Patient } from '@/types';
import { Badge } from '@/components/ui';

interface PatientDataSheetProps {
  patient: Patient;
  eyeExam?: {
    va_od?: string;
    va_os?: string;
    biometry_od_k1?: number;
    biometry_od_k2?: number;
    biometry_od_al?: number;
    biometry_os_k1?: number;
    biometry_os_k2?: number;
    biometry_os_al?: number;
  };
  diagnosis?: {
    cataract?: boolean;
    pterygium?: boolean;
    pseudophakia?: boolean;
    refraction_error?: boolean;
  };
  printable?: boolean;
}

export function PatientDataSheet({
  patient,
  eyeExam,
  diagnosis,
  printable = false,
}: PatientDataSheetProps) {
  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (birthdate: string) => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className={`bg-background ${printable ? 'print:p-8' : 'border border-border rounded-lg p-6'} shadow-sm`}>
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {patient.lastname}, {patient.firstname} {patient.middlename}
            </h2>
            <p className="text-sm text-muted-foreground">
              Patient ID: {patient.patient_id}
            </p>
          </div>
          {(patient as any).patient_photo_url && (
            <img
              src={(patient as any).patient_photo_url}
              alt="Patient"
              className="w-24 h-24 rounded-lg object-cover border-2 border-border"
            />
          )}
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Demographics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-medium text-muted-foreground w-32">Age:</span>
              <span className="text-foreground">{(patient as any).age || calculateAge(patient.birthdate!)} years</span>
            </div>
            <div className="flex">
              <span className="font-medium text-muted-foreground w-32">Birthdate:</span>
              <span className="text-foreground">{formatDate(patient.birthdate)}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-muted-foreground w-32">Gender:</span>
              <span className="text-foreground">{patient.gender}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-muted-foreground w-32">Civil Status:</span>
              <span className="text-foreground">{(patient as any).civil_status || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Contact Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-medium text-muted-foreground w-32">Contact:</span>
              <span className="text-foreground">{patient.contact_number || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-muted-foreground">Address:</span>
              <span className="text-foreground mt-1">{patient.address || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PhilHealth */}
      <div className="mb-6 pb-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">PhilHealth Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex">
            <span className="font-medium text-muted-foreground w-32">Member:</span>
            <span className="text-foreground">{(patient as any).philhealth_member ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex">
            <span className="font-medium text-muted-foreground w-32">PhilHealth No:</span>
            <span className="text-foreground">{(patient as any).philhealth_no || 'N/A'}</span>
          </div>
          <div className="flex">
            <span className="font-medium text-muted-foreground w-32">Category:</span>
            <span className="text-foreground">{(patient as any).philhealth_category || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Eye Examination */}
      {eyeExam && (
        <div className="mb-6 pb-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Eye Examination</h3>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-medium text-primary mb-2">Right Eye (OD)</p>
              <div className="space-y-1">
                <div className="flex">
                  <span className="text-muted-foreground w-24">Visual Acuity:</span>
                  <span className="text-foreground">{eyeExam.va_od || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">K1:</span>
                  <span className="text-foreground">{eyeExam.biometry_od_k1 || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">K2:</span>
                  <span className="text-foreground">{eyeExam.biometry_od_k2 || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">AL:</span>
                  <span className="text-foreground">{eyeExam.biometry_od_al || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="font-medium text-primary mb-2">Left Eye (OS)</p>
              <div className="space-y-1">
                <div className="flex">
                  <span className="text-muted-foreground w-24">Visual Acuity:</span>
                  <span className="text-foreground">{eyeExam.va_os || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">K1:</span>
                  <span className="text-foreground">{eyeExam.biometry_os_k1 || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">K2:</span>
                  <span className="text-foreground">{eyeExam.biometry_os_k2 || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground w-24">AL:</span>
                  <span className="text-foreground">{eyeExam.biometry_os_al || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis */}
      {diagnosis && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Diagnosis</h3>
          <div className="flex flex-wrap gap-2">
            {diagnosis.cataract && (
              <Badge variant="for_surgery">Cataract</Badge>
            )}
            {diagnosis.pterygium && (
              <Badge variant="new">Pterygium</Badge>
            )}
            {diagnosis.pseudophakia && (
              <Badge variant="surgery">Pseudophakia</Badge>
            )}
            {diagnosis.refraction_error && (
              <Badge variant="graduated">Refraction Error</Badge>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
        <p>Branch: {patient.branch}</p>
        <p>Created: {formatDate(patient.created_at)}</p>
      </div>
    </div>
  );
}
