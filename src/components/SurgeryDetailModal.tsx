import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SurgeryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  surgery: any;
  onUpdate: () => void;
}

export function SurgeryDetailModal({ isOpen, onClose, surgery, onUpdate }: SurgeryDetailModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!surgery) return null;

  const calculateElapsedTime = (startTime: string) => {
    if (!startTime) return 'N/A';
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handleStageTransition = async (action: string) => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      let updateData: any = {};

      switch (action) {
        case 'admit':
          updateData = { admitted_time: now, started_waiting: now, stage: 'waiting' };
          break;
        case 'start_prep':
          updateData = { ended_waiting: now, started_prep: now, stage: 'prep' };
          break;
        case 'start_surgery':
          updateData = { ended_prep: now, started_prog: now, stage: 'in_progress', status: 'In Progress' };
          break;
        case 'end_surgery':
          updateData = { ended_prog: now, started_recovery: now, stage: 'recovery' };
          break;
        case 'complete':
          updateData = { ended_recovery: now, stage: 'completed', status: 'Completed', active: false };
          break;
      }

      const { error } = await supabase
        .from('surgeries')
        .update(updateData)
        .eq('id', surgery.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Surgery status updated',
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating surgery:', error);
      toast({
        title: 'Error',
        description: 'Failed to update surgery status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    if (!cancelReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for cancellation',
        variant: 'destructive',
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmCancel = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('surgeries')
        .update({
          stage: 'cancelled',
          status: 'Cancelled',
          cancelreason: cancelReason,
          active: false,
        })
        .eq('id', surgery.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Surgery cancelled',
      });

      setShowConfirmDialog(false);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error cancelling surgery:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel surgery',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionButton = () => {
    switch (surgery.stage) {
      case 'scheduled':
        return (
          <Button onClick={() => handleStageTransition('admit')} disabled={loading}>
            Admit Patient
          </Button>
        );
      case 'waiting':
        return (
          <Button onClick={() => handleStageTransition('start_prep')} disabled={loading}>
            Start Prep
          </Button>
        );
      case 'prep':
        return (
          <Button onClick={() => handleStageTransition('start_surgery')} disabled={loading}>
            Start Surgery
          </Button>
        );
      case 'in_progress':
        return (
          <Button onClick={() => handleStageTransition('end_surgery')} disabled={loading}>
            End Surgery
          </Button>
        );
      case 'recovery':
        return (
          <Button onClick={() => handleStageTransition('complete')} disabled={loading}>
            Complete & Discharge
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Surgery Details" size="lg">
      <div className="space-y-6">
        {/* Patient Info */}
        <div className="bg-secondary/30 border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Patient Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <p className="font-medium text-foreground">{surgery.patient_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Patient ID:</span>
              <p className="font-medium text-foreground">{surgery.patient_id}</p>
            </div>
          </div>
        </div>

        {/* Surgery Details */}
        <div className="bg-secondary/30 border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">Surgery Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Procedure:</span>
              <p className="font-medium text-foreground">{surgery.procedure}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Eye:</span>
              <p className="font-medium text-foreground">{surgery.eye_operated || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Scheduled Time:</span>
              <p className="font-medium text-foreground">{surgery.scheduled_time}</p>
            </div>
            <div>
              <span className="text-muted-foreground">IOL Power:</span>
              <p className="font-medium text-foreground">{surgery.iol_power || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Surgeon:</span>
              <p className="font-medium text-foreground">{surgery.surgeon || 'Not assigned'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Scrub Nurse:</span>
              <p className="font-medium text-foreground">{surgery.scrub_nurse || 'Not assigned'}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-secondary/30 border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Timeline</h3>
          <div className="space-y-2 text-sm">
            {surgery.admitted_time && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admitted:</span>
                <span className="text-foreground">{new Date(surgery.admitted_time).toLocaleTimeString()}</span>
              </div>
            )}
            {surgery.started_waiting && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waiting Started:</span>
                <span className="text-foreground">
                  {new Date(surgery.started_waiting).toLocaleTimeString()} 
                  {surgery.ended_waiting ? ` (${calculateElapsedTime(surgery.started_waiting)})` : ''}
                </span>
              </div>
            )}
            {surgery.started_prep && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prep Started:</span>
                <span className="text-foreground">
                  {new Date(surgery.started_prep).toLocaleTimeString()}
                  {surgery.ended_prep ? ` (${calculateElapsedTime(surgery.started_prep)})` : ''}
                </span>
              </div>
            )}
            {surgery.started_prog && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Surgery Started:</span>
                <span className="text-foreground">
                  {new Date(surgery.started_prog).toLocaleTimeString()}
                  {surgery.ended_prog ? ` (${calculateElapsedTime(surgery.started_prog)})` : ''}
                </span>
              </div>
            )}
            {surgery.started_recovery && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recovery Started:</span>
                <span className="text-foreground">
                  {new Date(surgery.started_recovery).toLocaleTimeString()}
                  {surgery.ended_recovery ? ` (${calculateElapsedTime(surgery.started_recovery)})` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Current Stage */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Current Stage:</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
              {surgery.stage?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Actions */}
        {!showCancelInput ? (
          <div className="flex gap-3">
            {surgery.stage !== 'completed' && surgery.stage !== 'cancelled' && (
              <>
                {getActionButton()}
                <Button
                  variant="secondary"
                  onClick={() => setShowCancelInput(true)}
                  disabled={loading}
                >
                  Cancel Surgery
                </Button>
              </>
            )}
            <Button variant="outline" onClick={onClose} fullWidth>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cancellation Reason *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                rows={3}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCancelClick} disabled={loading} variant="danger">
                Cancel Surgery
              </Button>
              <Button variant="outline" onClick={() => setShowCancelInput(false)}>
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmCancel}
          title="Confirm Cancellation"
          message="Are you sure you want to cancel this surgery? This action cannot be undone."
          confirmText="Yes, Cancel Surgery"
          cancelText="No, Keep Surgery"
          variant="danger"
          loading={loading}
        />
      </div>
    </Modal>
  );
}
