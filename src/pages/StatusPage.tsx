import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui';

interface QueueStats {
  patientRecordCreation: number;
  visualAcuity: number;
  ophthalmologyEval: number;
  surgeryScheduling: number;
  biometryTest: number;
}

interface TodaySurgery {
  id: string;
  patient_name: string;
  scheduled_time: string;
  procedure: string;
  status: string | null;
}

export function StatusPage() {
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [todaySurgeries, setTodaySurgeries] = useState<TodaySurgery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatusData();
  }, []);

  const fetchStatusData = async () => {
    try {
      // Fetch queue stats from intakes
      const { data: intakes, error: intakesError } = await supabase
        .from('intakes')
        .select('task_type')
        .eq('status', 'Pending');

      if (intakesError) throw intakesError;

      // Count by task type
      const stats: QueueStats = {
        patientRecordCreation: 0,
        visualAcuity: 0,
        ophthalmologyEval: 0,
        surgeryScheduling: 0,
        biometryTest: 0,
      };

      intakes?.forEach(intake => {
        switch (intake.task_type) {
          case 'patient_record_creation':
            stats.patientRecordCreation++;
            break;
          case 'visual_acuity':
            stats.visualAcuity++;
            break;
          case 'ophthalmology_eval':
            stats.ophthalmologyEval++;
            break;
          case 'surgery_scheduling':
            stats.surgeryScheduling++;
            break;
          case 'biometry_test':
            stats.biometryTest++;
            break;
        }
      });

      setQueueStats(stats);

      // Fetch today's surgeries
      const today = new Date().toISOString().split('T')[0];
      const { data: surgeries, error: surgeriesError } = await supabase
        .from('surgeries')
        .select(`
          id,
          scheduled_time,
          procedure,
          status,
          patients!inner (
            firstname,
            lastname
          )
        `)
        .eq('scheduled_date', today)
        .order('scheduled_time', { ascending: true });

      if (surgeriesError) throw surgeriesError;

      const formattedSurgeries = surgeries?.map(surgery => ({
        id: surgery.id,
        patient_name: `${surgery.patients.lastname}, ${surgery.patients.firstname}`,
        scheduled_time: surgery.scheduled_time,
        procedure: surgery.procedure,
        status: surgery.status,
      })) || [];

      setTodaySurgeries(formattedSurgeries);
    } catch (error) {
      console.error('Error fetching status data:', error);
    } finally {
      setLoading(false);
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
      <header className="bg-secondary px-6 md:px-10 py-6">
        <h1 className="text-3xl md:text-4xl font-medium text-gray-900">
          Clinic Status
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Real-time overview of clinic operations
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        {/* Patient Queue Status */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Queue by Department</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <QueueCard
              title="Patient Record Creation"
              count={queueStats?.patientRecordCreation || 0}
              color="blue"
            />
            <QueueCard
              title="Visual Acuity"
              count={queueStats?.visualAcuity || 0}
              color="green"
            />
            <QueueCard
              title="Ophthalmology Eval"
              count={queueStats?.ophthalmologyEval || 0}
              color="purple"
            />
            <QueueCard
              title="Surgery Scheduling"
              count={queueStats?.surgeryScheduling || 0}
              color="orange"
            />
            <QueueCard
              title="Biometry Test"
              count={queueStats?.biometryTest || 0}
              color="red"
            />
          </div>
        </div>

        {/* Today's Surgery Schedule */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Surgery Schedule</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {todaySurgeries.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Procedure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todaySurgeries.map(surgery => (
                    <tr key={surgery.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {surgery.scheduled_time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {surgery.patient_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {surgery.procedure}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          surgery.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          surgery.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {surgery.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No surgeries scheduled for today
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface QueueCardProps {
  title: string;
  count: number;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

function QueueCard({ title, count, color }: QueueCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>{count}</p>
    </div>
  );
}

export default StatusPage;
