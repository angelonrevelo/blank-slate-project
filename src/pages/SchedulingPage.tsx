import { useState, useEffect } from 'react';
import { useAppState } from '@/context/AppContext';
import { Button, Input, LoadingSpinner } from '@/components/ui';
import { PatientDataSheet } from '@/components/PatientDataSheet';
import { CalendarDayPicker } from '@/components/ui/CalendarDayPicker';
import { IOLSelectionTable } from '@/components/ui/IOLSelectionTable';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Patient } from '@/types';

export function SchedulingPage() {
  const { viewingBranch } = useAppState();
  const { toast } = useToast();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientEyeExam, setPatientEyeExam] = useState<any>(null);
  const [patientDiagnosis, setPatientDiagnosis] = useState<any>(null);
  const [surgeons, setSurgeons] = useState<any[]>([]);
  const [scheduledSurgeries, setScheduledSurgeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [surgeryForm, setSurgeryForm] = useState({
    procedure: '',
    eye: '',
    surgeonId: '',
    scheduledDate: new Date(),
    scheduledTime: '',
    clearanceFile: '',
  });

  const [iolPowers, setIolPowers] = useState<any>({});

  useEffect(() => {
    fetchPatients();
    fetchSurgeons();
  }, [viewingBranch]);

  useEffect(() => {
    if (surgeryForm.scheduledDate) {
      fetchScheduledSurgeries();
    }
  }, [surgeryForm.scheduledDate, viewingBranch]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('branch', viewingBranch)
        .eq('status', 'Active')
        .order('lastname', { ascending: true });

      if (error) throw error;
      setPatients((data || []) as Patient[]);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchSurgeons = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, firstname, lastname')
        .eq('title', 'Doctor')
        .eq('branch', viewingBranch);

      if (error) throw error;
      setSurgeons(data || []);
    } catch (error) {
      console.error('Error fetching surgeons:', error);
    }
  };

  const fetchScheduledSurgeries = async () => {
    try {
      const dateStr = surgeryForm.scheduledDate.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('surgeries')
        .select(`
          id,
          scheduled_time,
          procedure,
          patient:patients(firstname, lastname),
          surgeon:profiles!surgeries_surgeon_id_fkey(firstname, lastname)
        `)
        .eq('branch', viewingBranch)
        .eq('scheduled_date', dateStr)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setScheduledSurgeries(data || []);
    } catch (error) {
      console.error('Error fetching scheduled surgeries:', error);
    }
  };

  const handlePatientSelect = async (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient || null);

    if (patient) {
      // Fetch eye exam data
      const { data: examData } = await supabase
        .from('eye_examinations')
        .select('*')
        .eq('patient_id', patientId)
        .order('examination_date', { ascending: false })
        .limit(1)
        .single();

      setPatientEyeExam(examData);

      // Fetch diagnosis
      const { data: diagnosisData } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setPatientDiagnosis(diagnosisData);
    }
  };

  const handleScheduleSurgery = async () => {
    if (!selectedPatient || !surgeryForm.procedure || !surgeryForm.eye || !surgeryForm.surgeonId || !surgeryForm.scheduledTime) {
      toast({
        title: 'Missing Fields',
        description: 'Please complete all required fields',
        variant: 'destructive',
      });
      return;
    }

    // For cataract surgeries, require IOL selection
    if (surgeryForm.procedure === 'Cataract/Phacoemulsification' && !iolPowers.OD_A1 && !iolPowers.OS_A1) {
      toast({
        title: 'IOL Selection Required',
        description: 'Please select IOL powers for cataract surgery',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const dateStr = surgeryForm.scheduledDate.toISOString().split('T')[0];

      // Create surgery record
      const { error: surgeryError } = await supabase.from('surgeries').insert({
        patient_id: selectedPatient.id,
        procedure: surgeryForm.procedure,
        eye_operated: surgeryForm.eye as any,
        surgeon_id: surgeryForm.surgeonId,
        scheduled_date: dateStr,
        scheduled_time: surgeryForm.scheduledTime,
        branch: viewingBranch,
        stage: 'scheduled',
        status: 'Scheduled',
      });

      if (surgeryError) throw surgeryError;

      // Update patient biometry with IOL powers
      if (Object.keys(iolPowers).length > 0) {
        const biometryUpdate: any = {};
        if (surgeryForm.eye === 'OD' || surgeryForm.eye === 'OU') {
          biometryUpdate.biometry_od = { iol_powers: iolPowers };
        }
        if (surgeryForm.eye === 'OS' || surgeryForm.eye === 'OU') {
          biometryUpdate.biometry_os = { iol_powers: iolPowers };
        }

        await supabase
          .from('patients')
          .update(biometryUpdate)
          .eq('id', selectedPatient.id);
      }

      // Update patient surgery dates
      const surgeryDateUpdate: any = { surgery_eye: surgeryForm.eye };
      if (surgeryForm.eye === 'OD' || surgeryForm.eye === 'OU') {
        surgeryDateUpdate.surgerydate_od = dateStr;
      }
      if (surgeryForm.eye === 'OS' || surgeryForm.eye === 'OU') {
        surgeryDateUpdate.surgerydate_os = dateStr;
      }

      await supabase
        .from('patients')
        .update(surgeryDateUpdate)
        .eq('id', selectedPatient.id);

      toast({
        title: 'Success',
        description: 'Surgery scheduled successfully',
      });

      // Reset form
      setSurgeryForm({
        procedure: '',
        eye: '',
        surgeonId: '',
        scheduledDate: new Date(),
        scheduledTime: '',
        clearanceFile: '',
      });
      setIolPowers({});
      setSelectedPatient(null);
      fetchScheduledSurgeries();
    } catch (error) {
      console.error('Error scheduling surgery:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule surgery',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const procedureTypes = [
    'Cataract/Phacoemulsification',
    'LASIK',
    'Pterygium Surgery',
    'Glaucoma Surgery',
    'Retinal Surgery',
    'Other',
  ];

  const surgeryDates = scheduledSurgeries.map(s => new Date(s.scheduled_date));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-secondary px-6 md:px-10 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-medium text-foreground">Surgery Scheduling</h1>
          <span className="text-sm text-muted-foreground bg-background px-3 py-1 rounded-full">
            {viewingBranch} Branch
          </span>
        </div>
      </header>

      {/* Split Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Patient Selection & Data Sheet */}
        <div className="w-2/5 border-r border-border p-6 overflow-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Patient *
            </label>
            <select
              value={selectedPatient?.id || ''}
              onChange={(e) => handlePatientSelect(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Choose a patient...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.lastname}, {patient.firstname} ({patient.patient_id})
                </option>
              ))}
            </select>
          </div>

          {selectedPatient && (
            <PatientDataSheet
              patient={selectedPatient}
              eyeExam={patientEyeExam}
              diagnosis={patientDiagnosis}
            />
          )}
        </div>

        {/* Right Panel - Surgery Scheduling Form */}
        <div className="flex-1 p-6 overflow-auto">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Procedure & Eye Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Procedure Type *
                  </label>
                  <select
                    value={surgeryForm.procedure}
                    onChange={(e) => setSurgeryForm({ ...surgeryForm, procedure: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select procedure</option>
                    {procedureTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Eye to Operate *
                  </label>
                  <div className="flex gap-2">
                    {['OD', 'OS', 'OU'].map((eye) => (
                      <button
                        key={eye}
                        onClick={() => setSurgeryForm({ ...surgeryForm, eye })}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          surgeryForm.eye === eye
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {eye}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Surgeon & Date/Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Surgeon *
                  </label>
                  <select
                    value={surgeryForm.surgeonId}
                    onChange={(e) => setSurgeryForm({ ...surgeryForm, surgeonId: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select surgeon</option>
                    {surgeons.map((surgeon) => (
                      <option key={surgeon.id} value={surgeon.id}>
                        Dr. {surgeon.firstname} {surgeon.lastname}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Time *
                  </label>
                  <Input
                    type="time"
                    value={surgeryForm.scheduledTime}
                    onChange={(e) => setSurgeryForm({ ...surgeryForm, scheduledTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Calendar */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Surgery Date *
                </label>
                <CalendarDayPicker
                  selectedDate={surgeryForm.scheduledDate}
                  onDateSelect={(date) => setSurgeryForm({ ...surgeryForm, scheduledDate: date })}
                  surgeryDates={surgeryDates}
                />
              </div>

              {/* IOL Selection (for cataract surgeries) */}
              {surgeryForm.procedure === 'Cataract/Phacoemulsification' && (
                <div>
                  <IOLSelectionTable
                    initialValues={iolPowers}
                    onChange={setIolPowers}
                  />
                </div>
              )}

              {/* Clearance Section */}
              <div className="bg-secondary/50 border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Clearance Documents</h3>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>OD Clearance:</span>
                  <span className="text-foreground">{(selectedPatient as any).clearance_fileod || 'Not uploaded'}</span>
                </div>
                <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                  <span>OS Clearance:</span>
                  <span className="text-foreground">{(selectedPatient as any).clearance_fileos || 'Not uploaded'}</span>
                </div>
              </div>

              {/* Other Scheduled Surgeries */}
              {scheduledSurgeries.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Other Surgeries on {surgeryForm.scheduledDate.toLocaleDateString()}
                  </h3>
                  <div className="space-y-2">
                    {scheduledSurgeries.map((surgery) => (
                      <div key={surgery.id} className="bg-secondary/30 border border-border rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">
                              {surgery.patient.firstname} {surgery.patient.lastname}
                            </p>
                            <p className="text-muted-foreground">{surgery.procedure}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-foreground">{surgery.scheduled_time}</p>
                            <p className="text-xs text-muted-foreground">
                              {surgery.surgeon ? `Dr. ${surgery.surgeon.firstname} ${surgery.surgeon.lastname}` : 'No surgeon'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={handleScheduleSurgery}
                disabled={loading}
                fullWidth
                size="lg"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Schedule Surgery'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-muted mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <h3 className="text-lg font-medium text-foreground mb-2">Select a Patient</h3>
              <p className="text-muted-foreground">
                Choose a patient from the dropdown to begin scheduling surgery
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchedulingPage;
