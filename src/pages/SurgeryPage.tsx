import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Input, LoadingSpinner } from '@/components/ui';
import { supabase } from '@/integrations/supabase/client';

type Surgery = {
  id: string;
  patient: string;
  procedure: string;
  date: string;
  time: string;
  surgeon: string;
  status: string;
};

export function SurgeryPage() {
  const navigate = useNavigate();
  const { viewingBranch } = useAppState();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurgeries();
  }, [viewingBranch, selectedDate, filterStatus]);

  const fetchSurgeries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('surgeries')
        .select(`
          id,
          procedure,
          scheduled_date,
          scheduled_time,
          status,
          patient:patients(firstname, lastname),
          surgeon:profiles!surgeries_surgeon_id_fkey(firstname, lastname)
        `)
        .eq('branch', viewingBranch)
        .order('scheduled_date', { ascending: true });

      if (selectedDate) {
        query = query.eq('scheduled_date', selectedDate);
      }

      if (filterStatus !== 'all') {
        const statusMap: Record<string, 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'> = {
          'scheduled': 'Scheduled',
          'in-progress': 'In Progress',
          'completed': 'Completed',
          'cancelled': 'Cancelled',
        };
        const mappedStatus = statusMap[filterStatus];
        if (mappedStatus) {
          query = query.eq('status', mappedStatus);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedSurgeries: Surgery[] = (data || []).map((s: any) => ({
        id: s.id,
        patient: `${s.patient.firstname} ${s.patient.lastname}`,
        procedure: s.procedure,
        date: new Date(s.scheduled_date).toLocaleDateString(),
        time: s.scheduled_time,
        surgeon: s.surgeon ? `Dr. ${s.surgeon.firstname} ${s.surgeon.lastname}` : 'Not assigned',
        status: s.status,
      }));

      setSurgeries(formattedSurgeries);
    } catch (error) {
      console.error('Error fetching surgeries:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-secondary px-6 md:px-10 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-medium text-gray-900">
            Surgery Schedule
          </h1>
          
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
            {viewingBranch} Branch
          </span>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 md:px-10 py-4 bg-white border-b">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="md:w-48"
          />
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === filter.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Surgery List */}
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : surgeries.length > 0 ? (
          <div className="grid gap-4">
            {surgeries.map((surgery) => (
              <div
                key={surgery.id}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/information`, { state: { visitID: surgery.id } })}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{surgery.patient}</h3>
                    <p className="text-sm text-primary font-medium">{surgery.procedure}</p>
                    <p className="text-sm text-gray-500 mt-1">Surgeon: {surgery.surgeon}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{surgery.date}</span>
                      <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{surgery.time}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    surgery.status === 'Scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : surgery.status === 'In Progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : surgery.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : surgery.status === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {surgery.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Surgeries Scheduled</h3>
            <p className="text-gray-500">
              {selectedDate || filterStatus !== 'all'
                ? 'No surgeries match your search filters'
                : 'No surgeries scheduled yet'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SurgeryPage;
