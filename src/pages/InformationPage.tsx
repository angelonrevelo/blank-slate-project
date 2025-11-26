import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Button, Input } from '@/components/ui';

type InfoTabType = 'BasicInfo' | 'Clearance' | 'MedicalHistory' | 'Documents';

export function InformationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { infoTab, setInfoTab } = useAppState();
  
  // Get params from route state if available
  const routeState = location.state as {
    manualFirst?: string;
    manualMiddle?: string;
    manualLast?: string;
    visitID?: string;
  } | null;

  const [activeTab, setActiveTab] = useState<InfoTabType>(infoTab as InfoTabType || 'BasicInfo');
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: routeState?.manualFirst || '',
    middleName: routeState?.manualMiddle || '',
    lastName: routeState?.manualLast || '',
    birthDate: '',
    gender: '',
    contactNumber: '',
    address: '',
    chiefComplaint: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
  });

  const handleTabChange = (tab: InfoTabType) => {
    setActiveTab(tab);
    setInfoTab(tab);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const tabs = [
    { id: 'BasicInfo' as InfoTabType, label: 'Basic Info' },
    { id: 'MedicalHistory' as InfoTabType, label: 'Medical History' },
    { id: 'Clearance' as InfoTabType, label: 'Clearance' },
    { id: 'Documents' as InfoTabType, label: 'Documents' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-secondary px-6 md:px-10 py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl md:text-4xl font-medium text-gray-900">
            Patient Information
          </h1>
        </div>
        {routeState?.visitID && (
          <p className="text-sm text-gray-500 mt-2 ml-12">
            Visit ID: {routeState.visitID}
          </p>
        )}
      </header>

      {/* Tabs */}
      <div className="px-6 md:px-10 bg-white border-b">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {activeTab === 'BasicInfo' && (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  fullWidth
                />
                <Input
                  label="Middle Name"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  placeholder="Enter middle name"
                  fullWidth
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  fullWidth
                />
                <Input
                  type="date"
                  label="Birth Date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  fullWidth
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <Input
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="Enter contact number"
                  fullWidth
                />
              </div>
              
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
                fullWidth
              />

              <div className="pt-4">
                <Button fullWidth>Save Information</Button>
              </div>
            </div>
          )}

          {activeTab === 'MedicalHistory' && (
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chief Complaint
                </label>
                <textarea
                  name="chiefComplaint"
                  value={formData.chiefComplaint}
                  onChange={handleInputChange}
                  placeholder="Describe the main complaint"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical History
                </label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleInputChange}
                  placeholder="Previous medical conditions, surgeries, etc."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies
                  </label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    placeholder="List any allergies"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Medications
                  </label>
                  <textarea
                    name="medications"
                    value={formData.medications}
                    onChange={handleInputChange}
                    placeholder="List current medications"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button fullWidth>Save Medical History</Button>
              </div>
            </div>
          )}

          {activeTab === 'Clearance' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Clearance</h2>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <p className="text-gray-500">
                  Clearance information will be displayed here
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Connect to Supabase to manage clearances
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Documents' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
                <p className="text-gray-500">
                  Document uploads will be managed here
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Connect to Supabase to manage documents
                </p>
                <Button variant="outline" className="mt-4">
                  Upload Document
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InformationPage;
