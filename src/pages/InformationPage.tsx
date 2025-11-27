import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Button, Input, Switch, EyeSelector, FileUpload } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

type InfoTabType = 'InfoHistory' | 'Diagnosis' | 'EyeExam' | 'Clearance';

interface PatientData {
  id: string;
  patient_id: string;
  firstname: string;
  lastname: string;
  middlename?: string;
  birthdate: string;
  gender: string;
  contact_number?: string;
  address?: string;
  civil_status?: string;
  referred_by?: string;
  philhealth_member: boolean;
  philhealth_no?: string;
  philhealth_category?: string;
  previous_surgery_od: boolean;
  previous_surgery_od_date?: string;
  previous_surgery_os: boolean;
  previous_surgery_os_date?: string;
  previous_surgery_notes?: string;
}

export function InformationPage() {
  const navigate = useNavigate();
  const { setInfoTab } = useAppState();

  const [activeTab, setActiveTab] = useState<InfoTabType>('InfoHistory');
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<Partial<PatientData>>({
    philhealth_member: false,
    previous_surgery_od: false,
    previous_surgery_os: false,
  });

  // Chief Complaints checkboxes
  const [chiefComplaints, setChiefComplaints] = useState({
    blurredVision: false,
    eyePain: false,
    cloudy: false,
    itchy: false,
    floaters: false,
    redness: false,
    teary: false,
    headache: false,
    others: false,
  });

  // Ocular History checkboxes
  const [ocularHistory, setOcularHistory] = useState({
    trauma: false,
    glaucoma: false,
    retinopathy: false,
    cataract: false,
    others: false,
  });

  // Past Medical History checkboxes
  const [pastMedicalHistory, setPastMedicalHistory] = useState({
    diabetes: false,
    hpn: false,
    heartProblem: false,
    bloodThinner: false,
    others: false,
  });

  // Diagnosis form state
  const [diagnosis, setDiagnosis] = useState({
    pseudophakia: false,
    pseudophakiaLaterality: '' as 'OD' | 'OS' | 'OU' | '',
    pseudophakiaIol: '',
    cataract: false,
    cataractType: {
      mature: false,
      immature: false,
      hypermature: false,
      trauma: false,
    },
    cataractLaterality: '' as 'OD' | 'OS' | 'OU' | '',
    pterygium: false,
    pterygiumLaterality: '' as 'OD' | 'OS' | 'OU' | '',
    refractionError: false,
    refractionLaterality: '' as 'OD' | 'OS' | 'OU' | '',
    refractionNotes: '',
    other: false,
    otherDiagnosis: '',
    otherLaterality: '' as 'OD' | 'OS' | 'OU' | '',
  });

  // Eye Exam state
  const [eyeExam, setEyeExam] = useState({
    vaOd: '',
    vaOs: '',
    vaOdCorrected: '',
    vaOsCorrected: '',
    biometryOdK1: '',
    biometryOdK2: '',
    biometryOdAl: '',
    biometryOdAcd: '',
    biometryOsK1: '',
    biometryOsK2: '',
    biometryOsAl: '',
    biometryOsAcd: '',
  });

  // Surgery scheduling state
  const [surgerySchedule, setSurgerySchedule] = useState({
    scheduledDate: '',
    scheduledTime: '',
    procedure: '',
    eyeOperated: '' as 'OD' | 'OS' | 'OU' | '',
    iolPower: '',
    notes: '',
  });

  const handleTabChange = (tab: InfoTabType) => {
    setActiveTab(tab);
    setInfoTab(tab);
  };

  const calculateAge = (birthdate: string): number => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSavePatientInfo = async () => {
    setLoading(true);
    try {
      // Save patient data logic here
      console.log('Saving patient data:', patientData);
      // TODO: Implement Supabase save
    } catch (error) {
      console.error('Error saving patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'InfoHistory' as InfoTabType, label: 'INFO & HISTORY' },
    { id: 'Diagnosis' as InfoTabType, label: 'DIAGNOSIS' },
    { id: 'EyeExam' as InfoTabType, label: 'EYE EXAM' },
    { id: 'Clearance' as InfoTabType, label: 'CLEARANCE' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 md:px-10 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {patientData.lastname && patientData.firstname
                ? `${patientData.lastname}, ${patientData.firstname}`
                : 'Patient Information'}
            </h1>
            {patientData.patient_id && (
              <p className="text-sm text-gray-500">
                Patient ID: {patientData.patient_id}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 md:px-10 bg-white border-b">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
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
        <div className="max-w-5xl mx-auto">
          {/* INFO & HISTORY Tab */}
          {activeTab === 'InfoHistory' && (
            <div className="space-y-6">
              {/* Patient Identification */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Identification</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Patient ID"
                    value={patientData.patient_id || ''}
                    onChange={(e) => setPatientData({ ...patientData, patient_id: e.target.value })}
                    fullWidth
                  />
                  <Input
                    label="Last Name"
                    value={patientData.lastname || ''}
                    onChange={(e) => setPatientData({ ...patientData, lastname: e.target.value })}
                    required
                    fullWidth
                  />
                  <Input
                    label="First Name"
                    value={patientData.firstname || ''}
                    onChange={(e) => setPatientData({ ...patientData, firstname: e.target.value })}
                    required
                    fullWidth
                  />
                  <Input
                    label="Middle Name"
                    value={patientData.middlename || ''}
                    onChange={(e) => setPatientData({ ...patientData, middlename: e.target.value })}
                    fullWidth
                  />
                </div>
              </div>

              {/* Demographics */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Demographics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    type="date"
                    label="Date of Birth"
                    value={patientData.birthdate || ''}
                    onChange={(e) => setPatientData({ ...patientData, birthdate: e.target.value })}
                    required
                    fullWidth
                  />
                  <Input
                    label="Age"
                    value={patientData.birthdate ? calculateAge(patientData.birthdate).toString() : ''}
                    disabled
                    fullWidth
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-error">*</span>
                    </label>
                    <select
                      value={patientData.gender || ''}
                      onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Civil Status
                    </label>
                    <select
                      value={patientData.civil_status || ''}
                      onChange={(e) => setPatientData({ ...patientData, civil_status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    >
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Contact Number"
                    value={patientData.contact_number || ''}
                    onChange={(e) => setPatientData({ ...patientData, contact_number: e.target.value })}
                    fullWidth
                  />
                  <Input
                    label="Referred By"
                    value={patientData.referred_by || ''}
                    onChange={(e) => setPatientData({ ...patientData, referred_by: e.target.value })}
                    fullWidth
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label="Address"
                    value={patientData.address || ''}
                    onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
                    fullWidth
                  />
                </div>
              </div>

              {/* PhilHealth Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">PhilHealth Information</h2>
                <div className="space-y-4">
                  <Switch
                    checked={patientData.philhealth_member || false}
                    onChange={(checked) => setPatientData({ ...patientData, philhealth_member: checked })}
                    label="PhilHealth Member"
                  />
                  
                  {patientData.philhealth_member && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <Input
                        label="PhilHealth Number"
                        value={patientData.philhealth_no || ''}
                        onChange={(e) => setPatientData({ ...patientData, philhealth_no: e.target.value })}
                        fullWidth
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={patientData.philhealth_category || ''}
                          onChange={(e) => setPatientData({ ...patientData, philhealth_category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                        >
                          <option value="">Select Category</option>
                          <option value="Member">Member</option>
                          <option value="Dependent">Dependent</option>
                          <option value="Indigent">Indigent</option>
                          <option value="Senior">Senior Citizen</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Chief Complaint</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(chiefComplaints).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setChiefComplaints({ ...chiefComplaints, [key]: e.target.checked })}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ocular History */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ocular History</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(ocularHistory).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setOcularHistory({ ...ocularHistory, [key]: e.target.checked })}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Past Medical History */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Medical History</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(pastMedicalHistory).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setPastMedicalHistory({ ...pastMedicalHistory, [key]: e.target.checked })}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {key === 'hpn' ? 'HPN' : key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Previous Surgeries */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Previous Surgeries</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Switch
                        checked={patientData.previous_surgery_od || false}
                        onChange={(checked) => setPatientData({ ...patientData, previous_surgery_od: checked })}
                        label="Previous Surgery OD (Right Eye)"
                      />
                      {patientData.previous_surgery_od && (
                        <div className="mt-2">
                          <Input
                            type="date"
                            label="Surgery Date"
                            value={patientData.previous_surgery_od_date || ''}
                            onChange={(e) => setPatientData({ ...patientData, previous_surgery_od_date: e.target.value })}
                            fullWidth
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Switch
                        checked={patientData.previous_surgery_os || false}
                        onChange={(checked) => setPatientData({ ...patientData, previous_surgery_os: checked })}
                        label="Previous Surgery OS (Left Eye)"
                      />
                      {patientData.previous_surgery_os && (
                        <div className="mt-2">
                          <Input
                            type="date"
                            label="Surgery Date"
                            value={patientData.previous_surgery_os_date || ''}
                            onChange={(e) => setPatientData({ ...patientData, previous_surgery_os_date: e.target.value })}
                            fullWidth
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Surgery Notes
                    </label>
                    <textarea
                      value={patientData.previous_surgery_notes || ''}
                      onChange={(e) => setPatientData({ ...patientData, previous_surgery_notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Additional notes about previous surgeries"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSavePatientInfo} loading={loading} fullWidth>
                  Save Information
                </Button>
                <Button variant="outline" fullWidth>
                  View Patient Data Sheet PDF
                </Button>
              </div>
            </div>
          )}

          {/* DIAGNOSIS Tab */}
          {activeTab === 'Diagnosis' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Primary Diagnosis</h2>
                
                <div className="space-y-6">
                  {/* Pseudophakia */}
                  <div className="border-b pb-6">
                    <Switch
                      checked={diagnosis.pseudophakia}
                      onChange={(checked) => setDiagnosis({ ...diagnosis, pseudophakia: checked })}
                      label="Pseudophakia"
                    />
                    {diagnosis.pseudophakia && (
                      <div className="mt-4 ml-8 space-y-3">
                        <EyeSelector
                          label="Laterality"
                          value={diagnosis.pseudophakiaLaterality}
                          onChange={(value) => setDiagnosis({ ...diagnosis, pseudophakiaLaterality: value })}
                          required
                        />
                        <Input
                          label="IOL Details"
                          value={diagnosis.pseudophakiaIol}
                          onChange={(e) => setDiagnosis({ ...diagnosis, pseudophakiaIol: e.target.value })}
                          placeholder="Enter IOL power and type"
                          fullWidth
                        />
                      </div>
                    )}
                  </div>

                  {/* Cataract */}
                  <div className="border-b pb-6">
                    <Switch
                      checked={diagnosis.cataract}
                      onChange={(checked) => setDiagnosis({ ...diagnosis, cataract: checked })}
                      label="Cataract"
                    />
                    {diagnosis.cataract && (
                      <div className="mt-4 ml-8 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(diagnosis.cataractType).map(([key, value]) => (
                              <label key={key} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={value}
                                  onChange={(e) => setDiagnosis({
                                    ...diagnosis,
                                    cataractType: { ...diagnosis.cataractType, [key]: e.target.checked }
                                  })}
                                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700 capitalize">{key}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <EyeSelector
                          label="Laterality"
                          value={diagnosis.cataractLaterality}
                          onChange={(value) => setDiagnosis({ ...diagnosis, cataractLaterality: value })}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Pterygium */}
                  <div className="border-b pb-6">
                    <Switch
                      checked={diagnosis.pterygium}
                      onChange={(checked) => setDiagnosis({ ...diagnosis, pterygium: checked })}
                      label="Pterygium"
                    />
                    {diagnosis.pterygium && (
                      <div className="mt-4 ml-8">
                        <EyeSelector
                          label="Laterality"
                          value={diagnosis.pterygiumLaterality}
                          onChange={(value) => setDiagnosis({ ...diagnosis, pterygiumLaterality: value })}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Error of Refraction */}
                  <div className="border-b pb-6">
                    <Switch
                      checked={diagnosis.refractionError}
                      onChange={(checked) => setDiagnosis({ ...diagnosis, refractionError: checked })}
                      label="Error of Refraction"
                    />
                    {diagnosis.refractionError && (
                      <div className="mt-4 ml-8 space-y-3">
                        <EyeSelector
                          label="Laterality"
                          value={diagnosis.refractionLaterality}
                          onChange={(value) => setDiagnosis({ ...diagnosis, refractionLaterality: value })}
                          required
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                          <textarea
                            value={diagnosis.refractionNotes}
                            onChange={(e) => setDiagnosis({ ...diagnosis, refractionNotes: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Additional refraction details"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Other */}
                  <div>
                    <Switch
                      checked={diagnosis.other}
                      onChange={(checked) => setDiagnosis({ ...diagnosis, other: checked })}
                      label="Other Diagnosis"
                    />
                    {diagnosis.other && (
                      <div className="mt-4 ml-8 space-y-3">
                        <Input
                          label="Diagnosis"
                          value={diagnosis.otherDiagnosis}
                          onChange={(e) => setDiagnosis({ ...diagnosis, otherDiagnosis: e.target.value })}
                          placeholder="Enter diagnosis"
                          fullWidth
                        />
                        <EyeSelector
                          label="Laterality"
                          value={diagnosis.otherLaterality}
                          onChange={(value) => setDiagnosis({ ...diagnosis, otherLaterality: value })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <Button fullWidth>Save Diagnosis</Button>
                </div>
              </div>
            </div>
          )}

          {/* EYE EXAM Tab */}
          {activeTab === 'EyeExam' && (
            <div className="space-y-6">
              {/* Visual Acuity */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Visual Acuity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">OD (Right Eye)</h3>
                    <div className="space-y-3">
                      <Input
                        label="Uncorrected"
                        value={eyeExam.vaOd}
                        onChange={(e) => setEyeExam({ ...eyeExam, vaOd: e.target.value })}
                        placeholder="20/20"
                        fullWidth
                      />
                      <Input
                        label="Corrected"
                        value={eyeExam.vaOdCorrected}
                        onChange={(e) => setEyeExam({ ...eyeExam, vaOdCorrected: e.target.value })}
                        placeholder="20/20"
                        fullWidth
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">OS (Left Eye)</h3>
                    <div className="space-y-3">
                      <Input
                        label="Uncorrected"
                        value={eyeExam.vaOs}
                        onChange={(e) => setEyeExam({ ...eyeExam, vaOs: e.target.value })}
                        placeholder="20/20"
                        fullWidth
                      />
                      <Input
                        label="Corrected"
                        value={eyeExam.vaOsCorrected}
                        onChange={(e) => setEyeExam({ ...eyeExam, vaOsCorrected: e.target.value })}
                        placeholder="20/20"
                        fullWidth
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Biometry */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Biometry</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">OD (Right Eye)</h3>
                    <div className="space-y-3">
                      <Input
                        label="K1"
                        value={eyeExam.biometryOdK1}
                        onChange={(e) => setEyeExam({ ...eyeExam, biometryOdK1: e.target.value })}
                        placeholder="e.g., 43.50"
                        fullWidth
                      />
                      <Input
                        label="K2"
                        value={eyeExam.biometryOdK2}
                        onChange={(e) => setEyeExam({ ...eyeExam, biometryOdK2: e.target.value })}
                        placeholder="e.g., 44.25"
                        fullWidth
                      />
                      <Input
                        label="AL (Axial Length)"
                        value={eyeExam.biometryOdAl}
                        onChange={(e) => setEyeExam({ ...eyeExam, biometryOdAl: e.target.value })}
                        placeholder="e.g., 23.45"
                        fullWidth
                      />
                      <Input
                        label="ACD (Anterior Chamber Depth)"
                        value={eyeExam.biometryOdAcd}
                        onChange={(e) => setEyeExam({ ...eyeExam, biometryOdAcd: e.target.value })}
                        placeholder="e.g., 3.15"
                        fullWidth
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">OS (Left Eye)</h3>
                    <div className="space-y-3">
                      <Input
                        label="K1"
                        value={eyeExam.biometryOsK1}
                        onChange={(e) => setEyeExam({ ...eyeExam, biometryOsK1: e.target.value })}
                        placeholder="e.g., 43.50"
                        fullWidth
                      />
                      <Input
                        label="K2"
                        value={eyeExam.biometryOsK2}
                        onChange={(e) => setEyeExam({ ...eyeExam, biometryOsK2: e.target.value })}
                        placeholder="e.g., 44.25"
                        fullWidth
                      />
                      <Input
                        label="AL (Axial Length)"
                        value={eyeExam.biometryOsAl}
                        onChange={(e) => setEyeExam({ ...eyeExam, biometryOsAl: e.target.value })}
                        placeholder="e.g., 23.45"
                        fullWidth
                      />
                      <Input
                        label="ACD (Anterior Chamber Depth)"
                        value={eyeExam.biometryOsAcd}
                        onChange={(e) => setEyeExam({ ...eyeExam, biometryOsAcd: e.target.value })}
                        placeholder="e.g., 3.15"
                        fullWidth
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Anterior Segment Exam */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Anterior Segment Exam</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">OD (Right Eye)</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 h-64 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Canvas drawing will be implemented here</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">OS (Left Eye)</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 h-64 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Canvas drawing will be implemented here</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button fullWidth>Save Eye Examination</Button>
            </div>
          )}

          {/* CLEARANCE Tab */}
          {activeTab === 'Clearance' && (
            <div className="space-y-6">
              {/* File Upload */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Clearance Documents</h2>
                <FileUpload
                  onFileSelect={(file) => console.log('File selected:', file)}
                  accept="image/*,.pdf"
                  maxSizeMB={10}
                  label="Upload Clearance File"
                />
              </div>

              {/* Surgery Scheduling */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Surgery Scheduling</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="date"
                      label="Scheduled Date"
                      value={surgerySchedule.scheduledDate}
                      onChange={(e) => setSurgerySchedule({ ...surgerySchedule, scheduledDate: e.target.value })}
                      required
                      fullWidth
                    />
                    <Input
                      type="time"
                      label="Scheduled Time"
                      value={surgerySchedule.scheduledTime}
                      onChange={(e) => setSurgerySchedule({ ...surgerySchedule, scheduledTime: e.target.value })}
                      required
                      fullWidth
                    />
                  </div>

                  <Input
                    label="Procedure"
                    value={surgerySchedule.procedure}
                    onChange={(e) => setSurgerySchedule({ ...surgerySchedule, procedure: e.target.value })}
                    placeholder="e.g., Phacoemulsification with IOL"
                    required
                    fullWidth
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EyeSelector
                      label="Eye to Operate"
                      value={surgerySchedule.eyeOperated}
                      onChange={(value) => setSurgerySchedule({ ...surgerySchedule, eyeOperated: value })}
                      required
                    />
                    <Input
                      label="IOL Power"
                      value={surgerySchedule.iolPower}
                      onChange={(e) => setSurgerySchedule({ ...surgerySchedule, iolPower: e.target.value })}
                      placeholder="e.g., +22.0D"
                      fullWidth
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Surgery Notes
                    </label>
                    <textarea
                      value={surgerySchedule.notes}
                      onChange={(e) => setSurgerySchedule({ ...surgerySchedule, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Additional surgery notes"
                    />
                  </div>
                </div>
              </div>

              <Button fullWidth>Schedule Surgery</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InformationPage;
