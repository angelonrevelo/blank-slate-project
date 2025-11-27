import { useState, useEffect } from 'react';
import { Modal, Button, Input, LoadingSpinner, Checkbox } from '@/components/ui';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FollowupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  followupId: string | null;
  onUpdate: () => void;
}

export function FollowupDetailModal({ isOpen, onClose, followupId, onUpdate }: FollowupDetailModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [followup, setFollowup] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    workflow_status: 'clearance' as 'clearance' | 'medical_management' | 'surgery_board' | 'post_op_evaluation' | 'doctor_referral',
    forbiometry: false,
    forbiometrynotes: '',
    forva: false,
    forvanotes: '',
    forsurgery: false,
    forsurgerynotes: '',
    surgeryeye: '' as 'OD' | 'OS' | 'OU' | '',
    postponesurgery: false,
    torefer: false,
    toreferdoctor: '',
    torefernotes: '',
    graduated: false,
    graduatednotes: '',
    acceptdate: '',
    reminddate: '',
    returndate: '',
    notes: '',
  });

  useEffect(() => {
    if (followupId && isOpen) {
      fetchFollowupDetails();
      fetchDoctors();
    }
  }, [followupId, isOpen]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, firstname, lastname')
        .eq('title', 'Doctor');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchFollowupDetails = async () => {
    if (!followupId) return;

    setLoading(true);
    try {
      const { data: followupData, error: followupError } = await supabase
        .from('followups')
        .select(`
          *,
          patient:patients(*)
        `)
        .eq('id', followupId)
        .single();

      if (followupError) throw followupError;

      setFollowup(followupData);
      setPatient(followupData.patient);

      // Populate form with existing data
      setFormData({
        workflow_status: (followupData.workflow_status || 'clearance') as any,
        forbiometry: followupData.forbiometry || false,
        forbiometrynotes: followupData.forbiometrynotes || '',
        forva: followupData.forva || false,
        forvanotes: followupData.forvanotes || '',
        forsurgery: followupData.forsurgery || false,
        forsurgerynotes: followupData.forsurgerynotes || '',
        surgeryeye: (followupData.surgeryeye || '') as any,
        postponesurgery: followupData.postponesurgery || false,
        torefer: followupData.torefer || false,
        toreferdoctor: followupData.toreferdoctor || '',
        torefernotes: followupData.torefernotes || '',
        graduated: followupData.graduated || false,
        graduatednotes: followupData.graduatednotes || '',
        acceptdate: followupData.acceptdate || '',
        reminddate: followupData.reminddate || '',
        returndate: followupData.returndate || '',
        notes: followupData.notes || '',
      });
    } catch (error) {
      console.error('Error fetching followup details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load followup details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!followupId) return;

    setLoading(true);
    try {
      // Update followup record
      const updateData: any = {
        ...formData,
        surgeryeye: formData.surgeryeye || null,
      };
      
      const { error: followupError } = await supabase
        .from('followups')
        .update(updateData)
        .eq('id', followupId);

      if (followupError) throw followupError;

      // If graduated, update patient stage
      if (formData.graduated) {
        await supabase
          .from('patients')
          .update({
            stage: 'graduated',
            graduateddate: new Date().toISOString().split('T')[0],
            graduatednotes: formData.graduatednotes,
          })
          .eq('id', patient.id);
      }

      // If to refer, update patient stage
      if (formData.torefer) {
        await supabase
          .from('patients')
          .update({
            stage: 'to_refer',
            toreferdate: new Date().toISOString().split('T')[0],
            torefernotes: formData.torefernotes,
          })
          .eq('id', patient.id);
      }

      toast({
        title: 'Success',
        description: 'Followup updated successfully',
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating followup:', error);
      toast({
        title: 'Error',
        description: 'Failed to update followup',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteFollowup = async () => {
    if (!followupId) return;

    setLoading(true);
    try {
      await supabase
        .from('followups')
        .update({ status: 'Completed' })
        .eq('id', followupId);

      toast({
        title: 'Success',
        description: 'Followup marked as completed',
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error completing followup:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete followup',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!followup || !patient) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Followup Details" size="xl">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </Modal>
    );
  }

  const workflowStages = [
    { value: 'clearance', label: 'Clearance' },
    { value: 'medical_management', label: 'Medical Management' },
    { value: 'surgery_board', label: 'Surgery Board' },
    { value: 'post_op_evaluation', label: 'Post-Op Evaluation' },
    { value: 'doctor_referral', label: 'Doctor Referral' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Followup Management" size="xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Patient Info */}
        <div className="bg-secondary/30 border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Patient Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <p className="font-medium text-foreground">
                {patient.lastname}, {patient.firstname} {patient.middlename}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Patient ID:</span>
              <p className="font-medium text-foreground">{patient.patient_id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Age:</span>
              <p className="font-medium text-foreground">{patient.age} years</p>
            </div>
            <div>
              <span className="text-muted-foreground">Contact:</span>
              <p className="font-medium text-foreground">{patient.contact_number || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Workflow Stage Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Workflow Stage *
          </label>
          <select
            value={formData.workflow_status}
            onChange={(e) => setFormData({ ...formData, workflow_status: e.target.value as any })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {workflowStages.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>

        {/* Treatment Plan Options */}
        <div className="bg-secondary/30 border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Treatment Plan</h3>
          <div className="space-y-4">
            {/* For Biometry */}
            <div className="space-y-2">
              <Checkbox
                checked={formData.forbiometry}
                onChange={(e) => setFormData({ ...formData, forbiometry: e.target.checked })}
                label="Requires Biometry Test"
              />
              {formData.forbiometry && (
                <textarea
                  value={formData.forbiometrynotes}
                  onChange={(e) => setFormData({ ...formData, forbiometrynotes: e.target.value })}
                  placeholder="Biometry notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>

            {/* For VA */}
            <div className="space-y-2">
              <Checkbox
                checked={formData.forva}
                onChange={(e) => setFormData({ ...formData, forva: e.target.checked })}
                label="Requires Visual Acuity Test"
              />
              {formData.forva && (
                <textarea
                  value={formData.forvanotes}
                  onChange={(e) => setFormData({ ...formData, forvanotes: e.target.value })}
                  placeholder="VA test notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>

            {/* For Surgery */}
            <div className="space-y-2">
              <Checkbox
                checked={formData.forsurgery}
                onChange={(e) => setFormData({ ...formData, forsurgery: e.target.checked })}
                label="Proceed to Surgery"
              />
              {formData.forsurgery && (
                <>
                  <div className="flex gap-2 mt-2">
                    {(['OD', 'OS', 'OU'] as const).map((eye) => (
                      <button
                        key={eye}
                        onClick={() => setFormData({ ...formData, surgeryeye: eye })}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          formData.surgeryeye === eye
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {eye}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={formData.forsurgerynotes}
                    onChange={(e) => setFormData({ ...formData, forsurgerynotes: e.target.value })}
                    placeholder="Surgery notes..."
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </>
              )}
            </div>

            {/* Postpone Surgery */}
            <div className="space-y-2">
              <Checkbox
                checked={formData.postponesurgery}
                onChange={(e) => setFormData({ ...formData, postponesurgery: e.target.checked })}
                label="Postpone Surgery"
              />
            </div>

            {/* To Refer */}
            <div className="space-y-2">
              <Checkbox
                checked={formData.torefer}
                onChange={(e) => setFormData({ ...formData, torefer: e.target.checked })}
                label="Refer to Specialist"
              />
              {formData.torefer && (
                <>
                  <select
                    value={formData.toreferdoctor}
                    onChange={(e) => setFormData({ ...formData, toreferdoctor: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select doctor...</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstname} {doctor.lastname}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={formData.torefernotes}
                    onChange={(e) => setFormData({ ...formData, torefernotes: e.target.value })}
                    placeholder="Referral notes..."
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </>
              )}
            </div>

            {/* Graduated */}
            <div className="space-y-2">
              <Checkbox
                checked={formData.graduated}
                onChange={(e) => setFormData({ ...formData, graduated: e.target.checked })}
                label="Mark as Graduated (Treatment Complete)"
              />
              {formData.graduated && (
                <textarea
                  value={formData.graduatednotes}
                  onChange={(e) => setFormData({ ...formData, graduatednotes: e.target.value })}
                  placeholder="Graduation notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>
          </div>
        </div>

        {/* Important Dates */}
        <div className="bg-secondary/30 border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Important Dates</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Accept Date</label>
              <Input
                type="date"
                value={formData.acceptdate}
                onChange={(e) => setFormData({ ...formData, acceptdate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Remind Date</label>
              <Input
                type="date"
                value={formData.reminddate}
                onChange={(e) => setFormData({ ...formData, reminddate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Return Date</label>
              <Input
                type="date"
                value={formData.returndate}
                onChange={(e) => setFormData({ ...formData, returndate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* General Notes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            General Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about this followup..."
            rows={3}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button onClick={handleSave} disabled={loading} fullWidth>
            {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
          </Button>
          <Button onClick={handleCompleteFollowup} disabled={loading} variant="secondary">
            Mark Complete
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
