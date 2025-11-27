import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Input, LoadingSpinner } from '@/components/ui';
import { KanbanBoard, type KanbanItem } from '@/components/KanbanBoard';

export function ReturningPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [kanbanItems, setKanbanItems] = useState<KanbanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const columns = [
    { id: 'clearance', title: 'Clearance', color: 'blue' },
    { id: 'medical_management', title: 'Medical Management', color: 'green' },
    { id: 'surgery_board', title: 'Surgery Board', color: 'purple' },
    { id: 'post_op_evaluation', title: 'Post-Op Eval', color: 'orange' },
    { id: 'doctor_referral', title: 'Doctor Referral', color: 'red' },
  ];

  useEffect(() => {
    fetchFollowups();
  }, [user, selectedDate]);

  const fetchFollowups = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('followups')
        .select(`
          id,
          workflow_status,
          followup_date,
          created_at,
          patients!inner (
            id,
            patient_id,
            firstname,
            lastname
          )
        `)
        .eq('followup_date', selectedDate)
        .eq('status', 'Scheduled')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform data to Kanban items
      const items: KanbanItem[] = data?.map(followup => {
        const waitTime = followup.created_at ? calculateWaitTime(followup.created_at) : '0m';

        return {
          id: followup.id,
          patientName: `${followup.patients.lastname}, ${followup.patients.firstname}`,
          patientId: followup.patients.patient_id,
          waitTime,
          status: getStatusBadge(followup.workflow_status),
          column: followup.workflow_status || 'clearance',
        };
      }) || [];

      setKanbanItems(items);
    } catch (error) {
      console.error('Error fetching followups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (workflowStatus: string | null): string => {
    const statusMap: Record<string, string> = {
      clearance: 'Checkup',
      medical_management: 'Revisit',
      surgery_board: 'Surgery',
      post_op_evaluation: 'Graduated',
      doctor_referral: 'Revisit',
    };
    return workflowStatus ? statusMap[workflowStatus] || 'Checkup' : 'Checkup';
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

  const handleCardClick = (item: KanbanItem) => {
    // Navigate to patient information page
    navigate(`/information?followupId=${item.id}`);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-secondary px-6 md:px-10 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-medium text-gray-900">
            Returning Patients
          </h1>
          
          {/* Date Filter */}
          <div className="w-full md:w-auto">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-auto"
            />
          </div>
        </div>
      </header>

      {/* Main Content - Kanban Board */}
      <div className="flex-1 p-6 md:px-10 overflow-auto">
        <KanbanBoard
          columns={columns}
          items={kanbanItems}
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
}

export default ReturningPage;
