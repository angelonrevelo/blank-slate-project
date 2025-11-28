import { Input, Switch } from '@/components/ui';
import { Camera } from 'lucide-react';
import type { PatientData, ChiefComplaints, OcularHistory, PastMedicalHistory } from './types';

interface InfoHistoryTabProps {
  patientData: Partial<PatientData>;
  setPatientData: (data: Partial<PatientData>) => void;
  patientPhoto: string;
  setShowCameraModal: (show: boolean) => void;
  chiefComplaints: ChiefComplaints;
  setChiefComplaints: (data: ChiefComplaints) => void;
  ocularHistory: OcularHistory;
  setOcularHistory: (data: OcularHistory) => void;
  pastMedicalHistory: PastMedicalHistory;
  setPastMedicalHistory: (data: PastMedicalHistory) => void;
  calculateAge: (birthdate: string) => number;
}

export function InfoHistoryTab({
  patientData,
  setPatientData,
  patientPhoto,
  setShowCameraModal,
  chiefComplaints,
  setChiefComplaints,
  ocularHistory,
  setOcularHistory,
  pastMedicalHistory,
  setPastMedicalHistory,
  calculateAge,
}: InfoHistoryTabProps) {
  return (
    <div className="space-y-4">
      {/* Patient Photo */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Patient Photo</h2>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 border-2 border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {patientPhoto ? (
              <img src={patientPhoto} alt="Patient" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <button
            onClick={() => setShowCameraModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            {patientPhoto ? 'Retake Photo' : 'Capture Photo'}
          </button>
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            label="Patient ID"
            value={patientData.patient_id || ''}
            onChange={(e) => setPatientData({ ...patientData, patient_id: e.target.value })}
            fullWidth
            size="sm"
            disabled
          />
          <Input
            label="Last Name"
            value={patientData.lastname || ''}
            onChange={(e) => setPatientData({ ...patientData, lastname: e.target.value })}
            required
            fullWidth
            size="sm"
          />
          <Input
            label="First Name"
            value={patientData.firstname || ''}
            onChange={(e) => setPatientData({ ...patientData, firstname: e.target.value })}
            required
            fullWidth
            size="sm"
          />
          <Input
            label="Middle Name"
            value={patientData.middlename || ''}
            onChange={(e) => setPatientData({ ...patientData, middlename: e.target.value })}
            fullWidth
            size="sm"
          />
        </div>
      </div>

      {/* Demographics */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Demographics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            type="date"
            label="Date of Birth"
            value={patientData.birthdate || ''}
            onChange={(e) => setPatientData({ ...patientData, birthdate: e.target.value })}
            required
            fullWidth
            size="sm"
          />
          <Input
            label="Age"
            value={patientData.birthdate ? calculateAge(patientData.birthdate).toString() : ''}
            disabled
            fullWidth
            size="sm"
          />
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Gender <span className="text-destructive">*</span>
            </label>
            <select
              value={patientData.gender || ''}
              onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Civil Status</label>
            <select
              value={patientData.civil_status || ''}
              onChange={(e) => setPatientData({ ...patientData, civil_status: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
            >
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
              <option value="Separated">Separated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Contact Number"
            value={patientData.contact_number || ''}
            onChange={(e) => setPatientData({ ...patientData, contact_number: e.target.value })}
            fullWidth
            size="sm"
          />
          <Input
            label="Referred By"
            value={patientData.referred_by || ''}
            onChange={(e) => setPatientData({ ...patientData, referred_by: e.target.value })}
            fullWidth
            size="sm"
          />
        </div>
        <div className="mt-3">
          <Input
            label="Address"
            value={patientData.address || ''}
            onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
            fullWidth
            size="sm"
          />
        </div>
      </div>

      {/* PhilHealth Information */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">PhilHealth Information</h2>
        <div className="space-y-3">
          <Switch
            checked={patientData.philhealth_member || false}
            onChange={(checked) => setPatientData({ ...patientData, philhealth_member: checked })}
            label="PhilHealth Member"
          />
          {patientData.philhealth_member && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <Input
                label="PhilHealth Number"
                value={patientData.philhealth_no || ''}
                onChange={(e) => setPatientData({ ...patientData, philhealth_no: e.target.value })}
                fullWidth
                size="sm"
              />
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Category</label>
                <select
                  value={patientData.philhealth_category || ''}
                  onChange={(e) => setPatientData({ ...patientData, philhealth_category: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
                >
                  <option value="">Select Category</option>
                  <option value="Member">Member</option>
                  <option value="Dependent">Dependent</option>
                  <option value="Indigent">Indigent</option>
                  <option value="Senior">Senior Citizen</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Chief Complaint</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(chiefComplaints).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setChiefComplaints({ ...chiefComplaints, [key]: e.target.checked })}
                className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
              />
              <span className="text-xs text-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Ocular History */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Ocular History</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(ocularHistory).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setOcularHistory({ ...ocularHistory, [key]: e.target.checked })}
                className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
              />
              <span className="text-xs text-foreground capitalize">{key}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Past Medical History */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Past Medical History</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(pastMedicalHistory).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setPastMedicalHistory({ ...pastMedicalHistory, [key]: e.target.checked })}
                className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
              />
              <span className="text-xs text-foreground capitalize">
                {key === 'hpn' ? 'HPN' : key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Previous Eye Surgery */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Previous Eye Surgery</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Switch
                checked={patientData.previous_surgery_od || false}
                onChange={(checked) => setPatientData({ ...patientData, previous_surgery_od: checked })}
                label="OD (Right Eye)"
              />
              {patientData.previous_surgery_od && (
                <Input
                  type="date"
                  label="Surgery Date"
                  value={patientData.previous_surgery_od_date || ''}
                  onChange={(e) => setPatientData({ ...patientData, previous_surgery_od_date: e.target.value })}
                  fullWidth
                  size="sm"
                />
              )}
            </div>
            <div className="space-y-2">
              <Switch
                checked={patientData.previous_surgery_os || false}
                onChange={(checked) => setPatientData({ ...patientData, previous_surgery_os: checked })}
                label="OS (Left Eye)"
              />
              {patientData.previous_surgery_os && (
                <Input
                  type="date"
                  label="Surgery Date"
                  value={patientData.previous_surgery_os_date || ''}
                  onChange={(e) => setPatientData({ ...patientData, previous_surgery_os_date: e.target.value })}
                  fullWidth
                  size="sm"
                />
              )}
            </div>
          </div>
          {(patientData.previous_surgery_od || patientData.previous_surgery_os) && (
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Surgery Notes</label>
              <textarea
                value={patientData.previous_surgery_notes || ''}
                onChange={(e) => setPatientData({ ...patientData, previous_surgery_notes: e.target.value })}
                rows={3}
                className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                placeholder="Details about previous surgeries..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
