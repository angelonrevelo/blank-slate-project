import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useAppState } from '@/context/AppContext';
import { Button, LoadingSpinner } from '@/components/ui';
import { KanbanBoard, type KanbanItem } from '@/components/KanbanBoard';

export function MyTasksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { viewSetting, setViewSetting } = useAppState();
  const [kanbanItems, setKanbanItems] = useState<KanbanItem[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { id: 'patient_record_creation', title: 'Patient Record Creation', color: 'blue' },
    { id: 'visual_acuity', title: 'Visual Acuity', color: 'green' },
    { id: 'ophthalmology_eval', title: 'Ophthalmology Eval', color: 'purple' },
    { id: 'surgery_scheduling', title: 'Surgery Scheduling', color: 'orange' },
    { id: 'biometry_test', title: 'Biometry Test', color: 'red' },
  ];

  useEffect(() => {
    fetchTasks();
  }, [user, viewSetting]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Build query based on view setting
      let query = supabase
        .from('intakes')
        .select(`
          id,
          task_type,
          created_at,
          assigned_to,
          patients!inner (
            id,
            patient_id,
            firstname,
            lastname
          ),
          profiles!assigned_to (
            firstname,
            lastname
          )
        `)
        .eq('status', 'Pending');

      // Filter by assigned user if "VIEW MY TASKS"
      if (viewSetting === 'ViewMyTasks') {
        query = query.eq('assigned_to', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) throw error;

      // Transform data to Kanban items
      const items: KanbanItem[] = data?.map(intake => {
        const waitTime = intake.created_at ? calculateWaitTime(intake.created_at) : '0m';
        const assignedName = intake.profiles 
          ? `${intake.profiles.lastname}, ${intake.profiles.firstname}`
          : 'Unassigned';

        return {
          id: intake.id,
          patientName: `${intake.patients.lastname}, ${intake.patients.firstname}`,
          patientId: intake.patients.patient_id,
          assignedTo: assignedName,
          waitTime,
          column: intake.task_type || 'patient_record_creation',
        };
      }) || [];

      setKanbanItems(items);
    } catch (error) {
      console.error('Error fetching tasks:', error);
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

  const handleCardClick = (item: KanbanItem) => {
    // Navigate to patient information page
    navigate(`/information?intakeId=${item.id}`);
  };

  const handleNewVisit = () => {
    // Navigate to patients page to create new visit
    navigate('/patients');
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
      <header className="bg-secondary px-6 md:px-8 py-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            My Tasks
          </h1>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewSetting('ViewMyTasks')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewSetting === 'ViewMyTasks'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                VIEW MY TASKS
              </button>
              <button
                onClick={() => setViewSetting('ViewAll')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewSetting === 'ViewAll'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                VIEW ALL
              </button>
            </div>

            {/* New Visit Button */}
            <Button
              onClick={handleNewVisit}
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              }
            >
              NEW VISIT
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Kanban Board */}
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <KanbanBoard
          columns={columns}
          items={kanbanItems}
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
}

export default MyTasksPage;
