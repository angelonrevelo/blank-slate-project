import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Button, Input, Modal, LoadingSpinner, Badge, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, ArrowUpDown, Eye, Download, Filter, X } from 'lucide-react';

type Patient = {
  id: string;
  patient_id: string;
  firstname: string;
  lastname: string;
  middlename: string | null;
  age: number | null;
  gender: string;
  contact_number: string | null;
  stage: string | null;
  status: string;
  created_at: string;
  surgery_eye: string | null;
};

export function PatientsPage() {
  const navigate = useNavigate();
  const { patientSort, setPatientSort, viewingBranch } = useAppState();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
  
  // Filter states
  const [stageFilter, setStageFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  const [newPatient, setNewPatient] = useState({
    lastname: '',
    firstname: '',
    middlename: '',
    birthdate: '',
    gender: '' as 'Male' | 'Female' | 'Other' | '',
    contact_number: '',
    address: '',
  });

  const stageOptions = [
    { value: 'new', label: 'New', variant: 'new' as const },
    { value: 'file', label: 'Filing', variant: 'file' as const },
    { value: 'va', label: 'Visual Acuity', variant: 'va' as const },
    { value: 'opth', label: 'Ophthalmology', variant: 'opth' as const },
    { value: 'bio', label: 'Biometry', variant: 'bio' as const },
    { value: 'for_surgery', label: 'For Surgery', variant: 'for_surgery' as const },
    { value: 'postponed', label: 'Postponed', variant: 'postponed' as const },
    { value: 'clearance', label: 'Clearance', variant: 'clearance' as const },
    { value: 'to_refer', label: 'To Refer', variant: 'to_refer' as const },
    { value: 'graduated', label: 'Graduated', variant: 'graduated' as const },
  ];

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, [viewingBranch, patientSort, stageFilter, statusFilter, doctorFilter, genderFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, firstname, lastname')
        .eq('title', 'Doctor')
        .eq('branch', viewingBranch);

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('patients')
        .select(`
          id,
          patient_id,
          firstname,
          lastname,
          middlename,
          age,
          gender,
          contact_number,
          stage,
          status,
          created_at,
          surgery_eye,
          intakes(assigned_doctor)
        `)
        .eq('branch', viewingBranch);

      // Apply stage filter
      if (stageFilter.length > 0) {
        query = query.in('stage', stageFilter as any);
      }

      // Apply status filter
      if (statusFilter.length > 0) {
        query = query.in('status', statusFilter as any);
      }

      // Apply gender filter
      if (genderFilter !== 'all') {
        query = query.eq('gender', genderFilter as any);
      }

      // Apply sorting
      if (patientSort === 'DATE_DESC') {
        query = query.order('created_at', { ascending: false });
      } else if (patientSort === 'DATE_ASC') {
        query = query.order('created_at', { ascending: true });
      } else if (patientSort === 'NAME_ASC') {
        query = query.order('lastname', { ascending: true });
      } else if (patientSort === 'NAME_DESC') {
        query = query.order('lastname', { ascending: false });
      } else if (patientSort === 'AGE_ASC') {
        query = query.order('age', { ascending: true });
      } else if (patientSort === 'AGE_DESC') {
        query = query.order('age', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredPatients = data || [];

      // Apply search filter
      if (searchQuery) {
        filteredPatients = filteredPatients.filter(p => {
          const patientId = p.patient_id ?? '';
          const name = `${p.firstname} ${p.lastname}`.toLowerCase();
          const search = searchQuery.toLowerCase();
          return name.includes(search) || patientId.toLowerCase().includes(search);
        });
      }

      // Apply doctor filter (based on most recent intake)
      if (doctorFilter !== 'all') {
        filteredPatients = filteredPatients.filter(p => {
          const intakes = (p as any).intakes;
          if (!intakes || intakes.length === 0) return false;
          // Check most recent intake
          return intakes[0]?.assigned_doctor === doctorFilter;
        });
      }

      setPatients(filteredPatients as Patient[]);
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

      // Generate patient ID using RPC function
      const { data: patientId, error: rpcError } = await supabase
        .rpc('get_next_patient_id', { p_branch: viewingBranch });

      if (rpcError) throw rpcError;

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
        stage: 'new',
        status: 'Active',
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

  const handleExportCSV = () => {
    if (patients.length === 0) {
      toast({
        title: 'No Data',
        description: 'No patients to export',
        variant: 'destructive',
      });
      return;
    }

    // Create CSV content
    const headers = ['Patient ID', 'Name', 'Age', 'Gender', 'Contact', 'Stage', 'Status', 'Surgery Eye', 'Registered Date'];
    const rows = patients.map(p => [
      p.patient_id,
      `${p.lastname}, ${p.firstname} ${p.middlename || ''}`.trim(),
      p.age?.toString() || 'N/A',
      p.gender,
      p.contact_number || 'N/A',
      p.stage || 'N/A',
      p.status,
      p.surgery_eye || 'N/A',
      new Date(p.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `patients_${viewingBranch}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Success',
      description: `Exported ${patients.length} patients to CSV`,
    });
  };

  const toggleStageFilter = (stage: string) => {
    setStageFilter(prev =>
      prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setStageFilter([]);
    setStatusFilter([]);
    setDoctorFilter('all');
    setGenderFilter('all');
    setSearchQuery('');
  };

  const activeFilterCount = stageFilter.length + statusFilter.length + 
    (doctorFilter !== 'all' ? 1 : 0) + (genderFilter !== 'all' ? 1 : 0);

  const sortOptions = [
    { value: 'DATE_DESC', label: 'Date (Newest First)' },
    { value: 'DATE_ASC', label: 'Date (Oldest First)' },
    { value: 'NAME_ASC', label: 'Name (A-Z)' },
    { value: 'NAME_DESC', label: 'Name (Z-A)' },
    { value: 'AGE_ASC', label: 'Age (Youngest First)' },
    { value: 'AGE_DESC', label: 'Age (Oldest First)' },
  ];

  const getStageBadge = (stage: string | null) => {
    if (!stage) return null;
    const option = stageOptions.find(s => s.value === stage);
    return option ? (
      <Badge variant={option.variant}>
        {option.label}
      </Badge>
    ) : null;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-8 py-4 border-b border-border bg-secondary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-foreground">Patients</h1>
            <p className="text-sm text-muted-foreground mt-1">{viewingBranch} Branch</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => setShowNewPatientModal(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Patient
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="search"
              placeholder="Search by name or patient ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFiltersModal(true)}
            size="sm"
            className="gap-2 relative"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setPatientSort(sortOptions[0].value)}
            size="sm"
            className="gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              size="sm"
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {stageFilter.map(stage => {
              const option = stageOptions.find(s => s.value === stage);
              return (
                <span key={stage} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                  {option?.label}
                  <button onClick={() => toggleStageFilter(stage)} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
            {statusFilter.map(status => (
              <span key={status} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                {status}
                <button onClick={() => toggleStatusFilter(status)} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {doctorFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                Doctor Filter
                <button onClick={() => setDoctorFilter('all')} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {genderFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                {genderFilter}
                <button onClick={() => setGenderFilter('all')} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
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
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Surgery Eye</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow 
                    key={patient.id}
                    className="cursor-pointer hover:bg-secondary/50"
                    onClick={() => navigate(`/information?patientId=${patient.id}`)}
                  >
                    <TableCell className="font-medium text-foreground">{patient.patient_id}</TableCell>
                    <TableCell className="text-foreground">
                      {patient.lastname}, {patient.firstname} {patient.middlename}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{patient.age || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">{patient.gender}</TableCell>
                    <TableCell className="text-muted-foreground">{patient.contact_number || 'N/A'}</TableCell>
                    <TableCell>{getStageBadge(patient.stage)}</TableCell>
                    <TableCell className="text-muted-foreground">{patient.surgery_eye || '-'}</TableCell>
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
                          navigate(`/information?patientId=${patient.id}`);
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
            
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <p>Showing {patients.length} patient{patients.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="bg-secondary rounded-full p-6 mb-4">
              <svg className="w-12 h-12 text-muted" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Patients Found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {searchQuery || activeFilterCount > 0
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
              label="Last Name *"
              placeholder="Enter last name"
              value={newPatient.lastname}
              onChange={(e) => setNewPatient({ ...newPatient, lastname: e.target.value })}
              required
              fullWidth
            />
            <Input
              label="First Name *"
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
              label="Birth Date *"
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
              <label className="block text-sm font-medium text-foreground mb-1">
                Gender *
              </label>
              <select 
                value={newPatient.gender}
                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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

      {/* Filters Modal */}
      <Modal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        title="Filter Patients"
        size="lg"
      >
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Stage Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Patient Stage</h3>
            <div className="grid grid-cols-2 gap-2">
              {stageOptions.map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stageFilter.includes(option.value)}
                    onChange={() => toggleStageFilter(option.value)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">
                    <Badge variant={option.variant}>{option.label}</Badge>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Status</h3>
            <div className="flex gap-2">
              {['Active', 'Inactive'].map(status => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusFilter.includes(status)}
                    onChange={() => toggleStatusFilter(status)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Doctor Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Assigned Doctor</h3>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstname} {doctor.lastname}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Gender</h3>
            <div className="flex gap-2">
              {['all', 'Male', 'Female', 'Other'].map(gender => (
                <button
                  key={gender}
                  onClick={() => setGenderFilter(gender)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    genderFilter === gender
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {gender === 'all' ? 'All' : gender}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              fullWidth
            >
              Clear All
            </Button>
            <Button onClick={() => setShowFiltersModal(false)} fullWidth>
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default PatientsPage;
