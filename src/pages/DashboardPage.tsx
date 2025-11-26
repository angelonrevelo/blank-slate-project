import { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { Button, Modal, Input } from '@/components/ui';

export function DashboardPage() {
  const { userNameWithTitle, version, viewingBranch, setViewingBranch } = useAppState();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-secondary px-6 md:px-10 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-medium text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {userNameWithTitle || 'User'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Branch Selector */}
            <select
              value={viewingBranch}
              onChange={(e) => setViewingBranch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Quezon">Quezon Branch</option>
              <option value="Tanauan">Tanauan Branch</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <StatsCard
            title="Today's Patients"
            value="--"
            subtitle="Scheduled for today"
            icon={
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            }
          />
          
          <StatsCard
            title="Follow-ups"
            value="--"
            subtitle="Pending follow-up visits"
            icon={
              <svg className="w-8 h-8 text-warning" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            }
          />
          
          <StatsCard
            title="Surgeries"
            value="--"
            subtitle="Scheduled surgeries"
            icon={
              <svg className="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            }
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setShowRescheduleModal(true)}
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                </svg>
              }
            >
              Reschedule Patient
            </Button>
            <Button
              variant="outline"
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                </svg>
              }
            >
              Add New Patient
            </Button>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-center py-8">
              Connect to Supabase to view recent activity
            </p>
          </div>
        </div>

        {/* Version */}
        <p className="text-xs text-gray-400 text-center mt-8">
          Version {version}
        </p>
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule Patient"
        size="md"
      >
        <div className="space-y-4">
          <Input
            type="date"
            label="New Date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
            fullWidth
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowRescheduleModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button fullWidth>
              Confirm
            </Button>
          </div>
        </div>
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
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
