import { useState, useEffect } from 'react';
import { useAppState } from '@/context/AppContext';
import { Input, LoadingSpinner } from '@/components/ui';
import { KanbanBoard } from '@/components/KanbanBoard';
import { SurgeryDetailModal } from '@/components/SurgeryDetailModal';
import { supabase } from '@/integrations/supabase/client';
import type { KanbanItem } from '@/components/KanbanBoard';

export function SurgeryPage() {
  const { viewingBranch } = useAppState();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurgery, setSelectedSurgery] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [surgeonFilter, setSurgeonFilter] = useState('all');
  const [surgeons, setSurgeons] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const kanbanColumns = [
    { id: 'scheduled', title: 'Scheduled', color: 'bg-blue-500' },
    { id: 'waiting', title: 'Waiting', color: 'bg-gray-500' },
    { id: 'prep', title: 'Prep', color: 'bg-orange-500' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-purple-500' },
    { id: 'recovery', title: 'Recovery', color: 'bg-yellow-500' },
    { id: 'completed', title: 'Completed', color: 'bg-green-500' },
  ];

  useEffect(() => {
    fetchSurgeries();
    fetchSurgeons();
  }, [viewingBranch, selectedDate, surgeonFilter]);

  const fetchSurgeons = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, firstname, lastname')
        .eq('title', 'Doctor')
        .eq('branch', viewingBranch);

      if (error) throw error;
      setSurgeons(data || []);
    } catch (error) {
      console.error('Error fetching surgeons:', error);
    }
  };

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
          stage,
          eye_operated,
          iol_power,
          admitted_time,
          started_waiting,
          ended_waiting,
          started_prep,
          ended_prep,
          started_prog,
          ended_prog,
          started_recovery,
          ended_recovery,
          cancelreason,
          patient:patients(id, patient_id, firstname, lastname),
          surgeon:profiles!surgeries_surgeon_id_fkey(firstname, lastname),
          scrub_nurse:profiles!surgeries_scrub_nurse_fkey(firstname, lastname)
        `)
        .eq('branch', viewingBranch)
        .eq('scheduled_date', selectedDate)
        .eq('active', true)
        .order('scheduled_time', { ascending: true });

      if (surgeonFilter !== 'all') {
        query = query.eq('surgeon_id', surgeonFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSurgeries(data || []);
    } catch (error) {
      console.error('Error fetching surgeries:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateElapsedTime = (startField: string, surgery: any) => {
    const startTime = surgery[startField];
    if (!startTime) return '';
    
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const getStageStartField = (stage: string) => {
    switch (stage) {
      case 'waiting': return 'started_waiting';
      case 'prep': return 'started_prep';
      case 'in_progress': return 'started_prog';
      case 'recovery': return 'started_recovery';
      default: return null;
    }
  };

  const kanbanItems: KanbanItem[] = surgeries
    .filter(s => {
      if (!searchQuery) return true;
      const search = searchQuery.toLowerCase();
      return (
        s.patient.firstname.toLowerCase().includes(search) ||
        s.patient.lastname.toLowerCase().includes(search) ||
        s.patient.patient_id.toLowerCase().includes(search)
      );
    })
    .map(surgery => {
      const startField = getStageStartField(surgery.stage);
      const elapsed = startField ? calculateElapsedTime(startField, surgery) : '';

      return {
        id: surgery.id,
        patientName: `${surgery.patient.firstname} ${surgery.patient.lastname}`,
        patientId: surgery.patient.patient_id,
        assignedTo: surgery.surgeon ? `Dr. ${surgery.surgeon.firstname} ${surgery.surgeon.lastname}` : undefined,
        waitTime: elapsed,
        status: surgery.procedure,
        column: surgery.stage || 'scheduled',
        metadata: {
          procedure: surgery.procedure,
          eye: surgery.eye_operated,
          scheduledTime: surgery.scheduled_time,
          iolPower: surgery.iol_power,
        },
      };
    });

  const handleCardClick = (item: KanbanItem) => {
    const surgery = surgeries.find(s => s.id === item.id);
    if (surgery) {
      setSelectedSurgery({
        ...surgery,
        patient_name: `${surgery.patient.firstname} ${surgery.patient.lastname}`,
        patient_id: surgery.patient.patient_id,
        surgeon: surgery.surgeon ? `Dr. ${surgery.surgeon.firstname} ${surgery.surgeon.lastname}` : 'Not assigned',
        scrub_nurse: surgery.scrub_nurse ? `${surgery.scrub_nurse.firstname} ${surgery.scrub_nurse.lastname}` : 'Not assigned',
      });
      setShowDetailModal(true);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-secondary px-6 md:px-8 py-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Surgery Day</h1>
          <span className="text-sm text-muted-foreground bg-card px-3 py-1 rounded-full border border-border">
            {viewingBranch} Branch
          </span>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 md:px-10 py-4 bg-background border-b border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="md:w-48"
          />
          
          <select
            value={surgeonFilter}
            onChange={(e) => setSurgeonFilter(e.target.value)}
            className="md:w-48 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Surgeons</option>
            {surgeons.map((surgeon) => (
              <option key={surgeon.id} value={surgeon.id}>
                Dr. {surgeon.firstname} {surgeon.lastname}
              </option>
            ))}
          </select>

          <Input
            type="text"
            placeholder="Search patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:flex-1"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <KanbanBoard
            columns={kanbanColumns}
            items={kanbanItems}
            onCardClick={handleCardClick}
            onSearch={setSearchQuery}
          />
        )}
      </div>

      {/* Surgery Detail Modal */}
      <SurgeryDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedSurgery(null);
        }}
        surgery={selectedSurgery}
        onUpdate={fetchSurgeries}
      />
    </div>
  );
}

export default SurgeryPage;
