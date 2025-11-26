import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Button, Input, Modal, LoadingSpinner } from '@/components/ui';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-secondary px-6 md:px-10 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-medium text-gray-900">
            Patients
          </h1>
          
          <div className="flex items-center gap-3">
            {/* Branch indicator */}
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
              {viewingBranch} Branch
            </span>
            
            <Button
              onClick={() => setShowNewPatientModal(true)}
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              }
            >
              New Patient
            </Button>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="px-6 md:px-10 py-4 bg-white border-b">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search patients by name or ID..."
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
          
          <Button
            variant="outline"
            onClick={() => setShowSortModal(true)}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            }
          >
            Sort
          </Button>
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : patients.length > 0 ? (
          <div className="grid gap-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{patient.name}</h3>
                    <p className="text-sm text-gray-500">ID: {patient.patient_id} • {patient.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    patient.status === 'Active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {patient.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'No patients match your search criteria'
                : 'Get started by adding your first patient'
              }
            </p>
            <Button onClick={() => setShowNewPatientModal(true)}>
              Add New Patient
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
