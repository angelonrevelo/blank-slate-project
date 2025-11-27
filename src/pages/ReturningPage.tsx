import { useState, useEffect } from 'react';
import { useAppState } from '@/context/AppContext';
import { Input, LoadingSpinner, Button } from '@/components/ui';
import { KanbanBoard, type KanbanItem } from '@/components/KanbanBoard';
import { FollowupDetailModal } from '@/components/FollowupDetailModal';
import { supabase } from '@/integrations/supabase/client';

export function ReturningPage() {
  const { viewingBranch } = useAppState();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFollowupId, setSelectedFollowupId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [workflowFilter, setWorkflowFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const kanbanColumns = [
    { id: 'clearance', title: 'Clearance', color: 'bg-blue-500' },
    { id: 'medical_management', title: 'Medical Management', color: 'bg-green-500' },
    { id: 'surgery_board', title: 'Surgery Board', color: 'bg-purple-500' },
    { id: 'post_op_evaluation', title: 'Post-Op Eval', color: 'bg-orange-500' },
    { id: 'doctor_referral', title: 'Doctor Referral', color: 'bg-red-500' },
  ];

  useEffect(() => {
    fetchFollowups();
  }, [viewingBranch, selectedDate, workflowFilter]);

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('followups')
        .select(`
          id,
          workflow_status,
          followup_date,
          created_at,
          status,
          forbiometry,
          forva,
          forsurgery,
          torefer,
          graduated,
          surgeryeye,
          patient:patients(
            id,
            patient_id,
            firstname,
            lastname
          )
        `)
        .eq('branch', viewingBranch)
        .eq('followup_date', selectedDate)
        .in('status', ['Scheduled'])
        .order('created_at', { ascending: true });

      if (workflowFilter !== 'all') {
        query = query.eq('workflow_status', workflowFilter as any);
      }

      const { data, error } = await query;

      if (error) throw error;

      setFollowups(data || []);
    } catch (error) {
      console.error('Error fetching followups:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWaitTime = (createdAt: string): string => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const getStatusLabel = (followup: any): string => {
    if (followup.graduated) return 'Graduated';
    if (followup.forsurgery) return 'For Surgery';
    if (followup.torefer) return 'For Referral';
    if (followup.forbiometry) return 'For Biometry';
    if (followup.forva) return 'For VA';
    return 'Follow-up';
  };

  const kanbanItems: KanbanItem[] = followups
    .filter(f => {
      if (!searchQuery) return true;
      const search = searchQuery.toLowerCase();
      return (
        f.patient.firstname.toLowerCase().includes(search) ||
        f.patient.lastname.toLowerCase().includes(search) ||
        f.patient.patient_id.toLowerCase().includes(search)
      );
    })
    .map(followup => {
      const waitTime = calculateWaitTime(followup.created_at);

      return {
        id: followup.id,
        patientName: `${followup.patient.firstname} ${followup.patient.lastname}`,
        patientId: followup.patient.patient_id,
        waitTime,
        status: getStatusLabel(followup),
        column: followup.workflow_status || 'clearance',
        metadata: {
          surgeryEye: followup.surgeryeye,
        },
      };
    });

  const handleCardClick = (item: KanbanItem) => {
    setSelectedFollowupId(item.id);
    setShowDetailModal(true);
  };

  const handleNewFollowup = () => {
    // Navigate to patient selection for new followup
    // This could open a modal or navigate to a new page
    alert('New Followup: Navigate to patient selection');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-secondary px-6 md:px-8 py-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Returning Patients</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground bg-card px-3 py-1 rounded-full border border-border">
              {viewingBranch} Branch
            </span>
            <Button onClick={handleNewFollowup} size="sm">
              New Followup
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 md:px-8 py-4 bg-background border-b border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="md:w-48"
          />

          <select
            value={workflowFilter}
            onChange={(e) => setWorkflowFilter(e.target.value)}
            className="md:w-56 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Workflows</option>
            {kanbanColumns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>

          <Input
            type="text"
            placeholder="Search patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:flex-1"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <KanbanBoard
            columns={kanbanColumns}
            items={kanbanItems}
            onCardClick={handleCardClick}
            onSearch={setSearchQuery}
          />
        )}
      </div>

      {/* Followup Detail Modal */}
      <FollowupDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedFollowupId(null);
        }}
        followupId={selectedFollowupId}
        onUpdate={fetchFollowups}
      />
    </div>
  );
}

export default ReturningPage;
