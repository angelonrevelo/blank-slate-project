import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useAppState } from '@/context/AppContext';
import { Button, Modal, Input, LoadingSpinner, Badge } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  todaysPatients: number;
  followups: number;
  surgeries: number;
  newPatients: number;
  returningPatients: number;
}

interface Assignment {
  id: string;
  patient_name: string;
  patient_id: string;
  assigned_to: string;
  stage: string;
  wait_time: string;
}

interface Surgery {
  id: string;
  patient_id: string;
  patient_name: string;
  scheduled_date: string;
  scheduled_time: string;
  procedure: string;
  status: string;
  surgeon_name?: string;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userNameWithTitle, version, viewingBranch, setViewingBranch } = useAppState();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    todaysPatients: 0,
    followups: 0,
    surgeries: 0,
    newPatients: 0,
    returningPatients: 0,
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [user, viewingBranch]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's statistics
      const [
        { count: todaysPatients },
        { count: followups },
        { count: surgeries },
        { data: intakesData },
        { data: surgeriesData },
      ] = await Promise.all([
        // Today's patients (intakes created today)
        supabase
          .from('intakes')
          .select('*', { count: 'exact', head: true })
          .eq('branch', viewingBranch)
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`),

        // Pending followups
        supabase
          .from('followups')
          .select('*', { count: 'exact', head: true })
          .eq('branch', viewingBranch)
          .eq('status', 'Scheduled'),

        // Scheduled surgeries (upcoming)
        supabase
          .from('surgeries')
          .select('*', { count: 'exact', head: true })
          .eq('branch', viewingBranch)
          .eq('status', 'Scheduled')
          .gte('scheduled_date', today),

        // Today's assignments with patient info
        supabase
          .from('intakes')
          .select(`
            id,
            stage,
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
          .eq('branch', viewingBranch)
          .eq('in_progress', true)
          .order('created_at', { ascending: true })
          .limit(10),

        // Today's scheduled surgeries with details
        supabase
          .from('surgeries')
          .select(`
            id,
            scheduled_date,
            scheduled_time,
            procedure,
            status,
            patients!inner (
              id,
              patient_id,
              firstname,
              lastname
            ),
            profiles!surgeon_id (
              firstname,
              lastname,
              title
            )
          `)
          .eq('branch', viewingBranch)
          .eq('scheduled_date', today)
          .order('scheduled_time', { ascending: true }),
      ]);

      setStats({
        todaysPatients: todaysPatients || 0,
        followups: followups || 0,
        surgeries: surgeries || 0,
        newPatients: intakesData?.filter(i => i.stage === 'file').length || 0,
        returningPatients: followups || 0,
      });

      // Transform assignments data
      const assignmentsFormatted: Assignment[] = intakesData?.map((intake: any) => {
        const waitTime = calculateWaitTime(intake.created_at);
        return {
          id: intake.id,
          patient_name: `${intake.patients.lastname}, ${intake.patients.firstname}`,
          patient_id: intake.patients.patient_id,
          assigned_to: intake.profiles
            ? `${intake.profiles.lastname}, ${intake.profiles.firstname}`
            : 'Unassigned',
          stage: intake.stage || 'file',
          wait_time: waitTime,
        };
      }) || [];
      setAssignments(assignmentsFormatted);

      // Transform surgeries data
      const surgeriesFormatted: Surgery[] = surgeriesData?.map((surgery: any) => ({
        id: surgery.id,
        patient_id: surgery.patients.patient_id,
        patient_name: `${surgery.patients.lastname}, ${surgery.patients.firstname}`,
        scheduled_date: surgery.scheduled_date,
        scheduled_time: surgery.scheduled_time,
        procedure: surgery.procedure,
        status: surgery.status,
        surgeon_name: surgery.profiles
          ? `${surgery.profiles.title} ${surgery.profiles.lastname}`
          : undefined,
      })) || [];
      setSurgeries(surgeriesFormatted);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
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

  const handleReschedule = async () => {
    if (!selectedSurgery || !rescheduleDate) {
      toast({
        title: 'Error',
        description: 'Please select a date',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('surgeries')
        .update({ scheduled_date: rescheduleDate })
        .eq('id', selectedSurgery.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Surgery rescheduled successfully',
      });

      setShowRescheduleModal(false);
      setSelectedSurgery(null);
      setRescheduleDate('');
      fetchDashboardData();
    } catch (error) {
      console.error('Error rescheduling surgery:', error);
      toast({
        title: 'Error',
        description: 'Failed to reschedule surgery',
        variant: 'destructive',
      });
    }
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
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, {userNameWithTitle || 'User'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Branch Selector */}
            <select
              value={viewingBranch}
              onChange={(e) => setViewingBranch(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Quezon City">Quezon City</option>
              <option value="Tanauan City">Tanauan City</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Today's Patients"
            value={stats.todaysPatients}
            subtitle="Total intakes today"
            icon={
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            }
          />
          
          <StatsCard
            title="New Patients"
            value={stats.newPatients}
            subtitle="In file stage"
            icon={
              <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            }
          />
          
          <StatsCard
            title="Follow-ups"
            value={stats.followups}
            subtitle="Pending visits"
            icon={
              <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            }
          />
          
          <StatsCard
            title="Surgeries"
            value={stats.surgeries}
            subtitle="Upcoming surgeries"
            icon={
              <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.17 6l2 2H20v10H4V6h5.17M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
              </svg>
            }
          />
        </div>

        {/* Patients Assigned Today */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Patients Assigned Today</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/my-tasks')}
            >
              View All Tasks
            </Button>
          </div>
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {assignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Patient ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Assigned To</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Stage</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Wait Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm text-foreground">{assignment.patient_id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{assignment.patient_name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{assignment.assigned_to}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="secondary">{assignment.stage}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{assignment.wait_time}</td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => navigate(`/information?intakeId=${assignment.id}`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No active assignments</p>
            )}
          </div>
        </div>

        {/* Surgery Board */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Today's Surgery Board</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/surgery')}
            >
              View Surgery Schedule
            </Button>
          </div>
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {surgeries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Patient ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Procedure</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Surgeon</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {surgeries.map((surgery) => (
                      <tr key={surgery.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{surgery.scheduled_time}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{surgery.patient_id}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{surgery.patient_name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{surgery.procedure}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{surgery.surgeon_name || 'TBA'}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={surgery.status === 'Scheduled' ? 'secondary' : 'success'}>
                            {surgery.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => {
                              setSelectedSurgery(surgery);
                              setShowRescheduleModal(true);
                            }}
                          >
                            Reschedule
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No surgeries scheduled for today</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => navigate('/patients')}
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              }
            >
              New Patient
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/returning')}
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              }
            >
              Accept Follow-up
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/scheduling')}
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                </svg>
              }
            >
              Schedule Surgery
            </Button>
          </div>
        </div>

        {/* Version */}
        <p className="text-xs text-muted-foreground text-center mt-8">
          Version {version}
        </p>
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedSurgery(null);
          setRescheduleDate('');
        }}
        title="Reschedule Surgery"
        size="md"
      >
        {selectedSurgery && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Patient</p>
              <p className="font-medium text-foreground">{selectedSurgery.patient_name}</p>
              <p className="text-sm text-muted-foreground mt-2">Current Date</p>
              <p className="font-medium text-foreground">{selectedSurgery.scheduled_date}</p>
            </div>
            
            <Input
              type="date"
              label="New Surgery Date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              fullWidth
            />
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedSurgery(null);
                  setRescheduleDate('');
                }}
                fullWidth
              >
                Cancel
              </Button>
              <Button onClick={handleReschedule} fullWidth>
                Confirm Reschedule
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <div className="bg-background border border-border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-muted rounded-lg">{icon}</div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
