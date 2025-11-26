import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Input } from '@/components/ui';

export function ReturningPage() {
  const navigate = useNavigate();
  const { viewingBranch } = useAppState();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Mock follow-up data - will be replaced with Supabase data
  const followUps: { id: string; patient: string; date: string; notes: string; status: string }[] = [];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-secondary px-6 md:px-10 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-medium text-gray-900">
            Returning Patients
          </h1>
          
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
            {viewingBranch} Branch
          </span>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 md:px-10 py-4 bg-white border-b">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search returning patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="md:w-48"
          />
        </div>
      </div>

      {/* Follow-up List */}
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        {followUps.length > 0 ? (
          <div className="grid gap-4">
            {followUps.map((followUp) => (
              <div
                key={followUp.id}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/information`, { state: { visitID: followUp.id } })}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{followUp.patient}</h3>
                    <p className="text-sm text-gray-500">{followUp.notes}</p>
                    <p className="text-xs text-gray-400 mt-1">Follow-up date: {followUp.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    followUp.status === 'Scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : followUp.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {followUp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Returning Patients</h3>
            <p className="text-gray-500">
              No follow-up appointments scheduled
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Connect to Supabase to view follow-ups
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReturningPage;
