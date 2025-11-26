import { useState, useEffect } from 'react';
import { useAppState } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui';

type TabType = 'ViewMyTasks' | 'ViewIntake' | 'ViewCancelled';

type Task = {
  id: string;
  patient_name: string;
  visit_date: string;
  chief_complaint: string;
  status: string;
};

export function MyTasksPage() {
  const { viewSetting, setViewSetting, viewingBranch } = useAppState();
  const [activeTab, setActiveTab] = useState<TabType>(viewSetting as TabType || 'ViewMyTasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setViewSetting(tab);
  };

  const tabs = [
    { id: 'ViewMyTasks' as TabType, label: 'My Tasks' },
    { id: 'ViewIntake' as TabType, label: 'Intake' },
    { id: 'ViewCancelled' as TabType, label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('intakes')
        .select(`
          id,
          visit_date,
          chief_complaint,
          status,
          patient:patients(firstname, lastname)
        `)
        .eq('branch', viewingBranch)
        .order('visit_date', { ascending: false });

      if (activeTab === 'ViewMyTasks') {
        query = query.eq('status', 'Pending');
      } else if (activeTab === 'ViewIntake') {
        query = query.in('status', ['Pending', 'Completed']);
      } else if (activeTab === 'ViewCancelled') {
        query = query.eq('status', 'Cancelled');
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedTasks: Task[] = (data || []).map((intake: any) => ({
        id: intake.id,
        patient_name: `${intake.patient.firstname} ${intake.patient.lastname}`,
        visit_date: new Date(intake.visit_date).toLocaleDateString(),
        chief_complaint: intake.chief_complaint || 'No complaint',
        status: intake.status,
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-secondary px-6 md:px-10 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-medium text-gray-900">
            My Tasks
          </h1>
          
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
            {viewingBranch} Branch
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 md:px-10 bg-white border-b">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : tasks.length > 0 ? (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{task.chief_complaint}</h3>
                    <p className="text-sm text-gray-500">Patient: {task.patient_name}</p>
                    <p className="text-xs text-gray-400 mt-1">{task.visit_date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : task.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks</h3>
            <p className="text-gray-500">
              {activeTab === 'ViewMyTasks'
                ? 'You have no pending tasks'
                : activeTab === 'ViewIntake'
                ? 'No intake records found'
                : 'No cancelled appointments'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTasksPage;
