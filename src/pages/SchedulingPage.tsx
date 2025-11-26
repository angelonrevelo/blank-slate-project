import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Button, Input, Modal } from '@/components/ui';

export function SchedulingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { viewingBranch } = useAppState();
  
  const routeState = location.state as { visitID?: string } | null;
  
  const [selectedDate, setSelectedDate] = useState('');
  const [showNewScheduleModal, setShowNewScheduleModal] = useState(false);
  
  // New schedule form state
  const [scheduleForm, setScheduleForm] = useState({
    patientName: '',
    procedureType: '',
    scheduledDate: '',
    notes: '',
  });

  // Mock schedule data - will be replaced with Supabase data
  const schedules: { id: string; patient: string; procedure: string; date: string; time: string; status: string }[] = [];

  const procedureTypes = [
    'Consultation',
    'Cataract Surgery',
    'LASIK',
    'Glaucoma Treatment',
    'Retinal Examination',
    'Other',
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-secondary px-6 md:px-10 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-medium text-gray-900">
              Scheduling
            </h1>
            {routeState?.visitID && (
              <p className="text-sm text-gray-500 mt-1">
                Visit ID: {routeState.visitID}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
              {viewingBranch} Branch
            </span>
            
            <Button
              onClick={() => setShowNewScheduleModal(true)}
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              }
            >
              New Schedule
            </Button>
          </div>
        </div>
      </header>

      {/* Date Filter */}
      <div className="px-6 md:px-10 py-4 bg-white border-b">
        <div className="flex items-center gap-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48"
          />
          <Button variant="outline" onClick={() => setSelectedDate('')}>
            Clear
          </Button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        {schedules.length > 0 ? (
          <div className="grid gap-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/information`, { state: { visitID: schedule.id } })}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{schedule.patient}</h3>
                    <p className="text-sm text-gray-500">{schedule.procedure}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{schedule.date}</span>
                      <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{schedule.time}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    schedule.status === 'Scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : schedule.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : schedule.status === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {schedule.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedules</h3>
            <p className="text-gray-500">
              No appointments scheduled for this date
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Connect to Supabase to view schedules
            </p>
            <Button className="mt-4" onClick={() => setShowNewScheduleModal(true)}>
              Schedule Appointment
            </Button>
          </div>
        )}
      </div>

      {/* New Schedule Modal */}
      <Modal
        isOpen={showNewScheduleModal}
        onClose={() => setShowNewScheduleModal(false)}
        title="New Schedule"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Patient Name"
            value={scheduleForm.patientName}
            onChange={(e) => setScheduleForm({ ...scheduleForm, patientName: e.target.value })}
            placeholder="Search or enter patient name"
            fullWidth
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Procedure Type
            </label>
            <select
              value={scheduleForm.procedureType}
              onChange={(e) => setScheduleForm({ ...scheduleForm, procedureType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select procedure</option>
              {procedureTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <Input
            type="datetime-local"
            label="Scheduled Date & Time"
            value={scheduleForm.scheduledDate}
            onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
            fullWidth
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowNewScheduleModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button fullWidth>
              Create Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SchedulingPage;
