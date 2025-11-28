import { useState, useEffect } from 'react';
import { Button, Input, Modal, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Select } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import {
  getCustomers,
  createCustomer,
  deleteCustomer,
  getSchedules,
  createSmsSchedule,
  deleteSchedule,
  getSmsLogs,
  type Customer,
  type SmsSchedule,
  type SmsLog,
} from '@/lib/smsSchedulerClient';
import { Trash2, Plus, MessageSquare } from 'lucide-react';

type TabType = 'customers' | 'schedules' | 'logs';

export default function SmsManagementPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [schedules, setSchedules] = useState<SmsSchedule[]>([]);
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Customer modal state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phoneNumber: '',
    timezone: 'Asia/Manila',
  });

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    customerId: '',
    message: '',
    firstRunAt: '',
  });

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    show: boolean;
    type: 'customer' | 'schedule';
    id: string;
    name: string;
  }>({ show: false, type: 'customer', id: '', name: '' });

  // Filters
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<string>('all');
  const [logCustomerFilter, setLogCustomerFilter] = useState<string>('all');
  const [logStatusFilter, setLogStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [customersData, schedulesData, logsData] = await Promise.all([
        getCustomers(),
        getSchedules(),
        getSmsLogs(),
      ]);
      setCustomers(customersData);
      setSchedules(schedulesData);
      setLogs(logsData);
    } catch (error) {
      toast({ title: 'Error loading data', description: String(error), variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCustomer() {
    try {
      await createCustomer(customerForm);
      toast({ title: 'Customer created', variant: 'success' });
      setShowCustomerModal(false);
      setCustomerForm({ name: '', phoneNumber: '', timezone: 'Asia/Manila' });
      loadData();
    } catch (error) {
      toast({ title: 'Error creating customer', description: String(error), variant: 'error' });
    }
  }

  async function handleCreateSchedule() {
    try {
      await createSmsSchedule({
        customerId: scheduleForm.customerId,
        message: scheduleForm.message,
        firstRunAt: new Date(scheduleForm.firstRunAt).toISOString(),
      });
      toast({ title: 'Schedule created', variant: 'success' });
      setShowScheduleModal(false);
      setScheduleForm({ customerId: '', message: '', firstRunAt: '' });
      loadData();
    } catch (error) {
      toast({ title: 'Error creating schedule', description: String(error), variant: 'error' });
    }
  }

  async function handleDelete() {
    try {
      if (deleteDialog.type === 'customer') {
        await deleteCustomer(deleteDialog.id);
        toast({ title: 'Customer deleted', variant: 'success' });
      } else {
        await deleteSchedule(deleteDialog.id);
        toast({ title: 'Schedule deleted', variant: 'success' });
      }
      setDeleteDialog({ show: false, type: 'customer', id: '', name: '' });
      loadData();
    } catch (error) {
      toast({ title: 'Error deleting', description: String(error), variant: 'error' });
    }
  }

  const filteredSchedules = schedules.filter((s) =>
    scheduleStatusFilter === 'all' ? true : s.status === scheduleStatusFilter
  );

  const filteredLogs = logs.filter((log) => {
    const customerMatch = logCustomerFilter === 'all' || log.customer_id === logCustomerFilter;
    const statusMatch = logStatusFilter === 'all' || log.status === logStatusFilter;
    return customerMatch && statusMatch;
  });

  function getStatusBadgeVariant(status: string): 'default' | 'success' | 'warning' | 'error' {
    if (status === 'sent' || status === 'success') return 'success';
    if (status === 'failed') return 'error';
    if (status === 'sending' || status === 'scheduled') return 'warning';
    return 'default';
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary px-6 md:px-8 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">SMS Management</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="px-6 md:px-8 flex gap-4">
          {(['customers', 'schedules', 'logs'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 md:p-8">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <>
            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Customers</h2>
                  <Button onClick={() => setShowCustomerModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Timezone</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone_number}</TableCell>
                        <TableCell>{customer.timezone}</TableCell>
                        <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                show: true,
                                type: 'customer',
                                id: customer.id,
                                name: customer.name,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-error" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Schedules Tab */}
            {activeTab === 'schedules' && (
              <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-4 items-center">
                    <h2 className="text-xl font-semibold text-foreground">Schedules</h2>
                    <Select
                      value={scheduleStatusFilter}
                      onChange={(e) => setScheduleStatusFilter(e.target.value)}
                      options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'scheduled', label: 'Scheduled' },
                        { value: 'sending', label: 'Sending' },
                        { value: 'sent', label: 'Sent' },
                        { value: 'failed', label: 'Failed' },
                        { value: 'cancelled', label: 'Cancelled' },
                      ]}
                    />
                  </div>
                  <Button onClick={() => setShowScheduleModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Schedule
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedules.map((schedule) => {
                      const customer = customers.find((c) => c.id === schedule.customer_id);
                      return (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">{customer?.name || 'Unknown'}</TableCell>
                          <TableCell className="max-w-xs truncate">{schedule.message_body}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(schedule.status)}>
                              {schedule.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{schedule.schedule_type}</TableCell>
                          <TableCell>{new Date(schedule.next_run_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="text"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({
                                  show: true,
                                  type: 'schedule',
                                  id: schedule.id,
                                  name: customer?.name || 'schedule',
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 text-error" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground">SMS Logs</h2>
                  <div className="flex gap-4">
                    <Select
                      value={logCustomerFilter}
                      onChange={(e) => setLogCustomerFilter(e.target.value)}
                      options={[
                        { value: 'all', label: 'All Customers' },
                        ...customers.map((c) => ({ value: c.id, label: c.name })),
                      ]}
                    />
                    <Select
                      value={logStatusFilter}
                      onChange={(e) => setLogStatusFilter(e.target.value)}
                      options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'success', label: 'Success' },
                        { value: 'failed', label: 'Failed' },
                      ]}
                    />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => {
                      const customer = customers.find((c) => c.id === log.customer_id);
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{customer?.name || 'Unknown'}</TableCell>
                          <TableCell className="max-w-xs truncate">{log.message_body}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(log.status)}>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(log.sent_at).toLocaleString()}</TableCell>
                          <TableCell className="text-error">{log.error_message || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Add Customer"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={customerForm.name}
            onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
            placeholder="Customer name"
            fullWidth
          />
          <Input
            label="Phone Number"
            value={customerForm.phoneNumber}
            onChange={(e) => setCustomerForm({ ...customerForm, phoneNumber: e.target.value })}
            placeholder="639171234567"
            fullWidth
          />
          <Select
            label="Timezone"
            value={customerForm.timezone}
            onChange={(e) => setCustomerForm({ ...customerForm, timezone: e.target.value })}
            options={[
              { value: 'Asia/Manila', label: 'Asia/Manila' },
              { value: 'UTC', label: 'UTC' },
            ]}
            fullWidth
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCustomerModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Create Schedule"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Customer"
            value={scheduleForm.customerId}
            onChange={(e) => setScheduleForm({ ...scheduleForm, customerId: e.target.value })}
            options={[
              { value: '', label: 'Select customer...' },
              ...customers.map((c) => ({ value: c.id, label: c.name })),
            ]}
            fullWidth
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Message</label>
            <textarea
              value={scheduleForm.message}
              onChange={(e) => setScheduleForm({ ...scheduleForm, message: e.target.value })}
              placeholder="Your SMS message"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
            />
          </div>
          <Input
            label="Schedule Date & Time"
            type="datetime-local"
            value={scheduleForm.firstRunAt}
            onChange={(e) => setScheduleForm({ ...scheduleForm, firstRunAt: e.target.value })}
            fullWidth
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSchedule}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.show}
        onClose={() => setDeleteDialog({ ...deleteDialog, show: false })}
        onConfirm={handleDelete}
        title={`Delete ${deleteDialog.type}`}
        message={`Are you sure you want to delete ${deleteDialog.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
