import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Button, Input, Modal, LoadingSpinner, Badge, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, ArrowUpDown, Eye } from 'lucide-react';

type Patient = {
  id: string;
  patient_id: string;
  name: string;
  date: string;
  status: string;
};

export function PatientsPage() {
  const navigate = useNavigate();
  const { patientSort, setPatientSort, viewingBranch } = useAppState();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPatient, setNewPatient] = useState({
    lastname: '',
    firstname: '',
    middlename: '',
    birthdate: '',
    gender: '' as 'Male' | 'Female' | 'Other' | '',
    contact_number: '',
    address: '',
  });

  useEffect(() => {
    fetchPatients();
  }, [viewingBranch, patientSort]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('patients')
        .select('*')
        .eq('branch', viewingBranch);

      // Apply sorting
      if (patientSort === 'DATE_DESC') {
        query = query.order('created_at', { ascending: false });
      } else if (patientSort === 'DATE_ASC') {
        query = query.order('created_at', { ascending: true });
      } else if (patientSort === 'NAME_ASC') {
        query = query.order('lastname', { ascending: true });
      } else if (patientSort === 'NAME_DESC') {
        query = query.order('lastname', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedPatients: Patient[] = (data || []).map((p) => ({
        id: p.id,
        patient_id: p.patient_id ?? '',
        name: `${p.firstname} ${p.lastname}`,
        date: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A',
        status: p.status ?? 'Active',
      }));

      // Apply search filter
      if (searchQuery) {
        const filtered = formattedPatients.filter(p => {
          const patientId = p.patient_id ?? '';
          return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 patientId.toLowerCase().includes(searchQuery.toLowerCase());
        });
        setPatients(filtered);
      } else {
        setPatients(formattedPatients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patients',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    if (!newPatient.lastname || !newPatient.firstname || !newPatient.birthdate || !newPatient.gender) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate patient ID
      const patientId = `P${Date.now()}`;

      const { error } = await supabase.from('patients').insert({
        patient_id: patientId,
        lastname: newPatient.lastname,
        firstname: newPatient.firstname,
        middlename: newPatient.middlename || null,
        birthdate: newPatient.birthdate,
        gender: newPatient.gender,
        contact_number: newPatient.contact_number || null,
        address: newPatient.address || null,
        branch: viewingBranch,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Patient created successfully',
      });

      setShowNewPatientModal(false);
      setNewPatient({
        lastname: '',
        firstname: '',
        middlename: '',
        birthdate: '',
        gender: '',
        contact_number: '',
        address: '',
      });
      fetchPatients();
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to create patient',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchQuery]);

  const sortOptions = [
    { value: 'DATE_DESC', label: 'Date (Newest First)' },
    { value: 'DATE_ASC', label: 'Date (Oldest First)' },
    { value: 'NAME_ASC', label: 'Name (A-Z)' },
    { value: 'NAME_DESC', label: 'Name (Z-A)' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
            <p className="text-sm text-muted-foreground mt-1">{viewingBranch} Branch</p>
          </div>
          
          <Button
            onClick={() => setShowNewPatientModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Patient
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="search"
              placeholder="Search by name or patient ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowSortModal(true)}
            className="gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </Button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : patients.length > 0 ? (
          <div className="px-8 py-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Registered Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow 
                    key={patient.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <TableCell className="font-medium">{patient.patient_id}</TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell className="text-muted-foreground">{patient.date}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={patient.status === 'Active' ? 'success' : 'secondary'}
                      >
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button 
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/patients/${patient.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination placeholder */}
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <p>Showing {patients.length} patient{patients.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="bg-secondary rounded-full p-6 mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {searchQuery 
                ? 'No patients match your search criteria. Try adjusting your filters.'
                : 'Get started by adding your first patient to the system.'
              }
            </p>
            <Button onClick={() => setShowNewPatientModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Patient
            </Button>
          </div>
        )}
      </div>

      {/* New Patient Modal */}
      <Modal
        isOpen={showNewPatientModal}
        onClose={() => setShowNewPatientModal(false)}
        title="New Patient"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Last Name"
              placeholder="Enter last name"
              value={newPatient.lastname}
              onChange={(e) => setNewPatient({ ...newPatient, lastname: e.target.value })}
              required
              fullWidth
            />
            <Input
              label="First Name"
              placeholder="Enter first name"
              value={newPatient.firstname}
              onChange={(e) => setNewPatient({ ...newPatient, firstname: e.target.value })}
              required
              fullWidth
            />
            <Input
              label="Middle Name"
              placeholder="Enter middle name"
              value={newPatient.middlename}
              onChange={(e) => setNewPatient({ ...newPatient, middlename: e.target.value })}
              fullWidth
            />
            <Input
              type="date"
              label="Birth Date"
              value={newPatient.birthdate}
              onChange={(e) => setNewPatient({ ...newPatient, birthdate: e.target.value })}
              required
              fullWidth
            />
            <Input
              label="Contact Number"
              placeholder="Enter contact number"
              value={newPatient.contact_number}
              onChange={(e) => setNewPatient({ ...newPatient, contact_number: e.target.value })}
              fullWidth
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select 
                value={newPatient.gender}
                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <Input
            label="Address"
            placeholder="Enter full address"
            value={newPatient.address}
            onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
            fullWidth
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowNewPatientModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePatient} fullWidth>
              Save Patient
            </Button>
          </div>
        </div>
      </Modal>

      {/* Sort Modal */}
      <Modal
        isOpen={showSortModal}
        onClose={() => setShowSortModal(false)}
        title="Sort Patients"
        size="sm"
      >
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                patientSort === option.value
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                setPatientSort(option.value);
                setShowSortModal(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default PatientsPage;
