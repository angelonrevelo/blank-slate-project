import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppState } from '@/context/AppContext';
import { Input, Modal, Button } from '@/components/ui';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  created_at: string | null;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
}

export function AuditLogsPage() {
  const { viewingBranch } = useAppState();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    action: '',
    table: '',
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [viewingBranch, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('branch', viewingBranch)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters.startDate) {
        query = query.gte('created_at', `${filters.startDate}T00:00:00`);
      }
      if (filters.endDate) {
        query = query.lte('created_at', `${filters.endDate}T23:59:59`);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.table) {
        query = query.eq('table_name', filters.table);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  return (
    <div className="h-full flex flex-col">
      <header className="bg-secondary px-6 md:px-8 py-6 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View system activity and data changes
        </p>
      </header>

      <div className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Filters */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              type="date"
              label="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              fullWidth
              size="sm"
            />
            <Input
              type="date"
              label="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              fullWidth
              size="sm"
            />
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
              >
                <option value="">All Actions</option>
                <option value="INSERT">INSERT</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Table</label>
              <select
                value={filters.table}
                onChange={(e) => setFilters({ ...filters, table: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
              >
                <option value="">All Tables</option>
                <option value="patients">Patients</option>
                <option value="intakes">Intakes</option>
                <option value="surgeries">Surgeries</option>
                <option value="followups">Followups</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading audit logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No audit logs found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            log.action === 'INSERT'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : log.action === 'UPDATE'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.table_name}</TableCell>
                      <TableCell className="font-mono text-xs">{log.record_id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <Button
                          variant="text"
                          size="sm"
                          onClick={() => handleViewDetail(log)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Audit Log Details"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Timestamp</label>
              <p className="text-sm text-muted-foreground">
                {selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Action</label>
              <p className="text-sm text-muted-foreground">{selectedLog.action}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Table</label>
              <p className="text-sm text-muted-foreground font-mono">{selectedLog.table_name}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Record ID</label>
              <p className="text-sm text-muted-foreground font-mono">{selectedLog.record_id}</p>
            </div>
            {selectedLog.old_data && (
              <div>
                <label className="text-xs font-semibold text-foreground">Old Data</label>
                <pre className="text-xs bg-muted p-3 rounded-lg mt-1 overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.old_data, null, 2)}
                </pre>
              </div>
            )}
            {selectedLog.new_data && (
              <div>
                <label className="text-xs font-semibold text-foreground">New Data</label>
                <pre className="text-xs bg-muted p-3 rounded-lg mt-1 overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.new_data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AuditLogsPage;
