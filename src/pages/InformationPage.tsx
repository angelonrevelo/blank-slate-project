import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Button, Input, Switch, EyeSelector, FileUpload, Modal, ImagePainter, WebCameraCapture, IOLSelectionTable, Checkbox } from '@/components/ui';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type InfoTabType = 'InfoHistory' | 'VisualAcuity' | 'AnteriorSegment' | 'SlitLamp' | 'Fundus' | 'Diagnosis' | 'Biometry' | 'Clearance' | 'TreatmentPlan';

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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { setInfoTab, viewingBranch } = useAppState();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<InfoTabType>('InfoHistory');
  const [loading, setLoading] = useState(true);
  const [showPreviousResults, setShowPreviousResults] = useState(false);
  
  // URL parameters
  const patientId = searchParams.get('patientId');
  const intakeId = searchParams.get('intakeId');
  const followupId = searchParams.get('followupId');
  const visitID = location.state?.visitID;
  
  const [patientData, setPatientData] = useState<Partial<PatientData>>({
    philhealth_member: false,
    previous_surgery_od: false,
    previous_surgery_os: false,
  });

  // ID Photo state
  const [idPhoto, setIdPhoto] = useState<string>('');
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Chief Complaints checkboxes with notes
  const [chiefComplaints, setChiefComplaints] = useState({
    blurred: false,
    cloudy: false,
    floaters: false,
    teary: false,
    headache: false,
    eyepain: false,
    itchy: false,
    redness: false,
    others: false,
    otherNotes: '',
  });

  // Ocular History checkboxes with notes
  const [ocularHistory, setOcularHistory] = useState({
    trauma: false,
    traumaNotes: '',
    glaucoma: false,
    glaucomaNotes: '',
    retinopathy: false,
    retinopathyNotes: '',
    cataract: false,
    cataractNotes: '',
    others: false,
    otherNotes: '',
  });

  // Past Medical History checkboxes with notes for each
  const [pastMedicalHistory, setPastMedicalHistory] = useState({
    diabetes: false,
    diabetesNotes: '',
    hpn: false,
    hpnNotes: '',
    heartproblem: false,
    heartproblemNotes: '',
    bloodthinner: false,
    bloodthinnerNotes: '',
    others: false,
    otherNotes: '',
  });

  // Medications field
  const [medications, setMedications] = useState('');

  // Visual Acuity state
  const [visualAcuity, setVisualAcuity] = useState({
    // Near - OD
    nearOd: '', nearOdBc: '', nearOdPh: '', nearOdAr: '', nearOdK1: '', nearOdK2: '', nearOdAxl: '',
    // Near - OS
    nearOs: '', nearOsBc: '', nearOsPh: '', nearOsAr: '', nearOsK1: '', nearOsK2: '', nearOsAxl: '',
    // Distance - OD
    distOd: '', distOdBc: '', distOdPh: '', distOdK1: '', distOdK2: '', distOdAxl: '',
    // Distance - OS
    distOs: '', distOsBc: '', distOsPh: '', distOsK1: '', distOsK2: '', distOsAxl: '',
  });

  // Anterior Segment state (using ImagePainter)
  const [anteriorSegment, setAnteriorSegment] = useState({
    odDrawingPng: '',
    odDrawingJson: '',
    osDrawingPng: '',
    osDrawingJson: '',
    options: {
      eyesa: false,
      eyesb: false,
      eyesc: false,
    },
  });

  // Slit Lamp state (using ImagePainter)
  const [slitLamp, setSlitLamp] = useState({
    odDrawingPng: '',
    odDrawingJson: '',
    osDrawingPng: '',
    osDrawingJson: '',
    odFindings: '',
    osFindings: '',
  });

  // Fundus state (using ImagePainter)
  const [fundus, setFundus] = useState({
    odDrawingPng: '',
    odDrawingJson: '',
    osDrawingPng: '',
    osDrawingJson: '',
    odFindings: '',
    osFindings: '',
    cupDiscRatioOd: '',
    cupDiscRatioOs: '',
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

  // Biometry state with IOL calculation
  const [biometry, setBiometry] = useState({
    odK1: '',
    odK2: '',
    odAl: '',
    odAcd: '',
    osK1: '',
    osK2: '',
    osAl: '',
    osAcd: '',
    // IOL calculation fields
    targetDiopterOd: '',
    targetDiopterOs: '',
    selectedK1Od: '',
    selectedK2Od: '',
    selectedAlOd: '',
    selectedK1Os: '',
    selectedK2Os: '',
    selectedAlOs: '',
  });

  // IOL Selection Table state
  const [iolPowers, setIolPowers] = useState({});

  // Surgery scheduling state
  const [surgerySchedule, setSurgerySchedule] = useState({
    scheduledDate: '',
    scheduledTime: '',
    procedure: '',
    eyeOperated: '' as 'OD' | 'OS' | 'OU' | '',
    iolPower: '',
    notes: '',
  });

  // Treatment Plan state (new tab)
  const [treatmentPlan, setTreatmentPlan] = useState({
    forbiometry: false,
    forbiometryNotes: '',
    forva: false,
    forvaNotes: '',
    forsurgery: false,
    forsurgeryNotes: '',
    forsurgeryEye: '' as 'OD' | 'OS' | 'OU' | '',
    postponesurgery: false,
    postponesurgeryDate: '',
    postponesurgeryNotes: '',
    requiresclearance: false,
    requiresclearanceNotes: '',
    torefer: false,
    toreferDoctor: '',
    toreferNotes: '',
    graduated: false,
    graduatedNotes: '',
  });

  const tabs = [
    { id: 'InfoHistory' as InfoTabType, label: 'INFO & HISTORY' },
    { id: 'VisualAcuity' as InfoTabType, label: 'VISUAL ACUITY' },
    { id: 'AnteriorSegment' as InfoTabType, label: 'ANTERIOR SEGMENT' },
    { id: 'SlitLamp' as InfoTabType, label: 'SLIT LAMP' },
    { id: 'Fundus' as InfoTabType, label: 'FUNDUS' },
    { id: 'Diagnosis' as InfoTabType, label: 'DIAGNOSIS' },
    { id: 'Biometry' as InfoTabType, label: 'BIOMETRY' },
    { id: 'Clearance' as InfoTabType, label: 'CLEARANCE' },
    { id: 'TreatmentPlan' as InfoTabType, label: 'TREATMENT PLAN' },
  ];

  const handleTabChange = (tab: InfoTabType) => {
    setActiveTab(tab);
    setInfoTab(tab);
  };

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      handleTabChange(tabs[currentIndex + 1].id);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      handleTabChange(tabs[currentIndex - 1].id);
    }
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

  // Load patient data on mount
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true);
        let patientDbId: string | null = null;
        let intakeDbId: string | null = null;

        // Determine which ID we have and fetch patient
        if (patientId) {
          patientDbId = patientId;
        } else if (intakeId) {
          const { data: intake } = await supabase
            .from('intakes')
            .select('patient_id')
            .eq('id', intakeId)
            .single();
          if (intake) {
            patientDbId = intake.patient_id;
            intakeDbId = intakeId;
          }
        } else if (followupId) {
          const { data: followup } = await supabase
            .from('followups')
            .select('patient_id, intake_id')
            .eq('id', followupId)
            .single();
          if (followup) {
            patientDbId = followup.patient_id;
            intakeDbId = followup.intake_id;
          }
        } else if (visitID) {
          // Check if visitID is an intake or followup
          const { data: intake } = await supabase
            .from('intakes')
            .select('patient_id, id')
            .eq('id', visitID)
            .maybeSingle();
          if (intake) {
            patientDbId = intake.patient_id;
            intakeDbId = intake.id;
          } else {
            const { data: followup } = await supabase
              .from('followups')
              .select('patient_id, intake_id')
              .eq('id', visitID)
              .maybeSingle();
            if (followup) {
              patientDbId = followup.patient_id;
              intakeDbId = followup.intake_id;
            }
          }
        }

        if (!patientDbId) {
          setLoading(false);
          return; // New patient form
        }

        // Fetch patient data
        const { data: patient, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientDbId)
          .single();

        if (patientError) throw patientError;

        if (patient) {
          setPatientData({
            id: patient.id,
            patient_id: patient.patient_id,
            firstname: patient.firstname,
            lastname: patient.lastname,
            middlename: patient.middlename || '',
            birthdate: patient.birthdate,
            gender: patient.gender,
            contact_number: patient.contact_number || '',
            address: patient.address || '',
            civil_status: patient.civil_status || '',
            referred_by: patient.referred_by || '',
            philhealth_member: patient.philhealth_member || false,
            philhealth_no: patient.philhealth_no || '',
            philhealth_category: patient.philhealth_category || '',
            previous_surgery_od: patient.previous_surgery_od || false,
            previous_surgery_od_date: patient.previous_surgery_od_date || '',
            previous_surgery_os: patient.previous_surgery_os || false,
            previous_surgery_os_date: patient.previous_surgery_os_date || '',
            previous_surgery_notes: patient.previous_surgery_notes || '',
          });
        }

        // Fetch intake data if we have an intake ID
        if (intakeDbId) {
          const { data: intake } = await supabase
            .from('intakes')
            .select('*')
            .eq('id', intakeDbId)
            .single();

          if (intake) {
            // Load chief complaints, ocular history, past medical history
            if (intake.chief_complaints) {
              const cc = intake.chief_complaints as any;
              setChiefComplaints({
                blurredVision: cc.blurredVision || false,
                eyePain: cc.eyePain || false,
                cloudy: cc.cloudy || false,
                itchy: cc.itchy || false,
                floaters: cc.floaters || false,
                redness: cc.redness || false,
                teary: cc.teary || false,
                headache: cc.headache || false,
                others: cc.others || false,
              });
            }
            if (intake.ocular_history) {
              const oh = intake.ocular_history as any;
              setOcularHistory({
                trauma: oh.trauma || false,
                glaucoma: oh.glaucoma || false,
                retinopathy: oh.retinopathy || false,
                cataract: oh.cataract || false,
                others: oh.others || false,
              });
            }
            if (intake.past_medical_history) {
              const pmh = intake.past_medical_history as any;
              setPastMedicalHistory({
                diabetes: pmh.diabetes || false,
                hpn: pmh.hpn || false,
                heartProblem: pmh.heartProblem || false,
                bloodThinner: pmh.bloodThinner || false,
                others: pmh.others || false,
              });
            }
          }

          // Fetch eye examination data
          const { data: exam } = await supabase
            .from('eye_examinations')
            .select('*')
            .eq('patient_id', patientDbId)
            .eq('intake_id', intakeDbId)
            .maybeSingle();

          if (exam) {
            setVisualAcuity({
              nearOd: exam.va_near_od || '',
              nearOdBc: exam.va_near_od_bc || '',
              nearOdPh: exam.va_near_od_ph || '',
              nearOdAr: exam.va_near_od_ar || '',
              nearOdK1: exam.va_near_od_k1 || '',
              nearOdK2: exam.va_near_od_k2 || '',
              nearOdAxl: exam.va_near_od_axl || '',
              nearOs: exam.va_near_os || '',
              nearOsBc: exam.va_near_os_bc || '',
              nearOsPh: exam.va_near_os_ph || '',
              nearOsAr: exam.va_near_os_ar || '',
              nearOsK1: exam.va_near_os_k1 || '',
              nearOsK2: exam.va_near_os_k2 || '',
              nearOsAxl: exam.va_near_os_axl || '',
              distOd: exam.va_dist_od || '',
              distOdBc: exam.va_dist_od_bc || '',
              distOdPh: exam.va_dist_od_ph || '',
              distOdK1: exam.va_dist_od_k1 || '',
              distOdK2: exam.va_dist_od_k2 || '',
              distOdAxl: exam.va_dist_od_axl || '',
              distOs: exam.va_dist_os || '',
              distOsBc: exam.va_dist_os_bc || '',
              distOsPh: exam.va_dist_os_ph || '',
              distOsK1: exam.va_dist_os_k1 || '',
              distOsK2: exam.va_dist_os_k2 || '',
              distOsAxl: exam.va_dist_os_axl || '',
            });

            setAnteriorSegment({
              odDrawing: exam.anterior_segment_od_drawing || '',
              osDrawing: exam.anterior_segment_os_drawing || '',
            });

            setSlitLamp({
              od: exam.slit_lamp_od || '',
              os: exam.slit_lamp_os || '',
            });

            setFundus({
              od: exam.fundus_od || '',
              os: exam.fundus_os || '',
              cupDiscRatioOd: exam.cup_disc_ratio_od || '',
              cupDiscRatioOs: exam.cup_disc_ratio_os || '',
            });

            setBiometry({
              odK1: exam.biometry_od_k1?.toString() || '',
              odK2: exam.biometry_od_k2?.toString() || '',
              odAl: exam.biometry_od_al?.toString() || '',
              odAcd: exam.biometry_od_acd?.toString() || '',
              osK1: exam.biometry_os_k1?.toString() || '',
              osK2: exam.biometry_os_k2?.toString() || '',
              osAl: exam.biometry_os_al?.toString() || '',
              osAcd: exam.biometry_os_acd?.toString() || '',
            });
          }

          // Fetch diagnosis data
          const { data: diagnosisData } = await supabase
            .from('diagnoses')
            .select('*')
            .eq('patient_id', patientDbId)
            .eq('intake_id', intakeDbId)
            .maybeSingle();

          if (diagnosisData) {
            setDiagnosis({
              pseudophakia: diagnosisData.pseudophakia || false,
              pseudophakiaLaterality: (diagnosisData.pseudophakia_laterality || '') as any,
              pseudophakiaIol: diagnosisData.pseudophakia_iol_details || '',
              cataract: diagnosisData.cataract || false,
              cataractType: {
                mature: diagnosisData.cataract_type === 'Mature',
                immature: diagnosisData.cataract_type === 'Immature',
                hypermature: diagnosisData.cataract_type === 'Hypermature',
                trauma: diagnosisData.cataract_type === 'Trauma',
              },
              cataractLaterality: (diagnosisData.cataract_laterality || '') as any,
              pterygium: diagnosisData.pterygium || false,
              pterygiumLaterality: (diagnosisData.pterygium_laterality || '') as any,
              refractionError: diagnosisData.refraction_error || false,
              refractionLaterality: (diagnosisData.refraction_laterality || '') as any,
              refractionNotes: diagnosisData.refraction_notes || '',
              other: !!diagnosisData.other_diagnosis,
              otherDiagnosis: diagnosisData.other_diagnosis || '',
              otherLaterality: (diagnosisData.other_laterality || '') as any,
            });
          }
        }
      } catch (error) {
        console.error('Error loading patient data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load patient data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [patientId, intakeId, followupId, visitID]);

  const handleSavePatientInfo = async () => {
    if (!patientData.lastname || !patientData.firstname || !patientData.birthdate || !patientData.gender) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields (name, birthdate, gender)',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let savedPatientId = patientData.id;

      // Save or update patient
      if (savedPatientId) {
        // Update existing patient
        const { error } = await supabase
          .from('patients')
          .update({
            lastname: patientData.lastname,
            firstname: patientData.firstname,
            middlename: patientData.middlename || null,
            birthdate: patientData.birthdate,
            gender: patientData.gender as any,
            contact_number: patientData.contact_number || null,
            address: patientData.address || null,
            civil_status: patientData.civil_status as any || null,
            referred_by: patientData.referred_by || null,
            philhealth_member: patientData.philhealth_member,
            philhealth_no: patientData.philhealth_no || null,
            philhealth_category: patientData.philhealth_category as any || null,
            previous_surgery_od: patientData.previous_surgery_od,
            previous_surgery_od_date: patientData.previous_surgery_od_date || null,
            previous_surgery_os: patientData.previous_surgery_os,
            previous_surgery_os_date: patientData.previous_surgery_os_date || null,
            previous_surgery_notes: patientData.previous_surgery_notes || null,
          })
          .eq('id', savedPatientId);

        if (error) throw error;
      } else {
        // Create new patient
        const generatedPatientId = `P${Date.now()}`;
        const { data: newPatient, error } = await supabase
          .from('patients')
          .insert({
            patient_id: generatedPatientId,
            lastname: patientData.lastname,
            firstname: patientData.firstname,
            middlename: patientData.middlename || null,
            birthdate: patientData.birthdate,
            gender: patientData.gender as any,
            contact_number: patientData.contact_number || null,
            address: patientData.address || null,
            civil_status: patientData.civil_status as any || null,
            referred_by: patientData.referred_by || null,
            philhealth_member: patientData.philhealth_member,
            philhealth_no: patientData.philhealth_no || null,
            philhealth_category: patientData.philhealth_category as any || null,
            previous_surgery_od: patientData.previous_surgery_od,
            previous_surgery_od_date: patientData.previous_surgery_od_date || null,
            previous_surgery_os: patientData.previous_surgery_os,
            previous_surgery_os_date: patientData.previous_surgery_os_date || null,
            previous_surgery_notes: patientData.previous_surgery_notes || null,
            branch: viewingBranch,
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        savedPatientId = newPatient.id;
        setPatientData({ ...patientData, id: savedPatientId, patient_id: generatedPatientId });
      }

      // Create or update intake if we have one
      let savedIntakeId = intakeId;
      if (!savedIntakeId && savedPatientId) {
        const { data: newIntake, error } = await supabase
          .from('intakes')
          .insert({
            patient_id: savedPatientId,
            branch: viewingBranch,
            chief_complaints: chiefComplaints,
            ocular_history: ocularHistory,
            past_medical_history: pastMedicalHistory,
            status: 'Pending',
          })
          .select()
          .single();

        if (error) throw error;
        savedIntakeId = newIntake.id;
      } else if (savedIntakeId) {
        const { error } = await supabase
          .from('intakes')
          .update({
            chief_complaints: chiefComplaints,
            ocular_history: ocularHistory,
            past_medical_history: pastMedicalHistory,
          })
          .eq('id', savedIntakeId);

        if (error) throw error;
      }

      // Save eye examination data
      if (savedPatientId && savedIntakeId) {
        const { data: existingExam } = await supabase
          .from('eye_examinations')
          .select('id')
          .eq('patient_id', savedPatientId)
          .eq('intake_id', savedIntakeId)
          .maybeSingle();

        const examData = {
          patient_id: savedPatientId,
          intake_id: savedIntakeId,
          branch: viewingBranch,
          va_near_od: visualAcuity.nearOd || null,
          va_near_od_bc: visualAcuity.nearOdBc || null,
          va_near_od_ph: visualAcuity.nearOdPh || null,
          va_near_od_ar: visualAcuity.nearOdAr || null,
          va_near_od_k1: visualAcuity.nearOdK1 || null,
          va_near_od_k2: visualAcuity.nearOdK2 || null,
          va_near_od_axl: visualAcuity.nearOdAxl || null,
          va_near_os: visualAcuity.nearOs || null,
          va_near_os_bc: visualAcuity.nearOsBc || null,
          va_near_os_ph: visualAcuity.nearOsPh || null,
          va_near_os_ar: visualAcuity.nearOsAr || null,
          va_near_os_k1: visualAcuity.nearOsK1 || null,
          va_near_os_k2: visualAcuity.nearOsK2 || null,
          va_near_os_axl: visualAcuity.nearOsAxl || null,
          va_dist_od: visualAcuity.distOd || null,
          va_dist_od_bc: visualAcuity.distOdBc || null,
          va_dist_od_ph: visualAcuity.distOdPh || null,
          va_dist_od_k1: visualAcuity.distOdK1 || null,
          va_dist_od_k2: visualAcuity.distOdK2 || null,
          va_dist_od_axl: visualAcuity.distOdAxl || null,
          va_dist_os: visualAcuity.distOs || null,
          va_dist_os_bc: visualAcuity.distOsBc || null,
          va_dist_os_ph: visualAcuity.distOsPh || null,
          va_dist_os_k1: visualAcuity.distOsK1 || null,
          va_dist_os_k2: visualAcuity.distOsK2 || null,
          va_dist_os_axl: visualAcuity.distOsAxl || null,
          anterior_segment_od_drawing: anteriorSegment.odDrawing || null,
          anterior_segment_os_drawing: anteriorSegment.osDrawing || null,
          slit_lamp_od: slitLamp.od || null,
          slit_lamp_os: slitLamp.os || null,
          fundus_od: fundus.od || null,
          fundus_os: fundus.os || null,
          cup_disc_ratio_od: fundus.cupDiscRatioOd || null,
          cup_disc_ratio_os: fundus.cupDiscRatioOs || null,
          biometry_od_k1: biometry.odK1 ? parseFloat(biometry.odK1) : null,
          biometry_od_k2: biometry.odK2 ? parseFloat(biometry.odK2) : null,
          biometry_od_al: biometry.odAl ? parseFloat(biometry.odAl) : null,
          biometry_od_acd: biometry.odAcd ? parseFloat(biometry.odAcd) : null,
          biometry_os_k1: biometry.osK1 ? parseFloat(biometry.osK1) : null,
          biometry_os_k2: biometry.osK2 ? parseFloat(biometry.osK2) : null,
          biometry_os_al: biometry.osAl ? parseFloat(biometry.osAl) : null,
          biometry_os_acd: biometry.osAcd ? parseFloat(biometry.osAcd) : null,
        };

        if (existingExam) {
          const { error } = await supabase
            .from('eye_examinations')
            .update(examData)
            .eq('id', existingExam.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('eye_examinations')
            .insert(examData);

          if (error) throw error;
        }

        // Save diagnosis data
        const { data: existingDiagnosis } = await supabase
          .from('diagnoses')
          .select('id')
          .eq('patient_id', savedPatientId)
          .eq('intake_id', savedIntakeId)
          .maybeSingle();

        const getCataractType = () => {
          if (diagnosis.cataractType.mature) return 'Mature';
          if (diagnosis.cataractType.immature) return 'Immature';
          if (diagnosis.cataractType.hypermature) return 'Hypermature';
          if (diagnosis.cataractType.trauma) return 'Trauma';
          return null;
        };

        const diagnosisData = {
          patient_id: savedPatientId,
          intake_id: savedIntakeId,
          branch: viewingBranch,
          created_by: user.id,
          pseudophakia: diagnosis.pseudophakia,
          pseudophakia_laterality: diagnosis.pseudophakiaLaterality || null,
          pseudophakia_iol_details: diagnosis.pseudophakiaIol || null,
          cataract: diagnosis.cataract,
          cataract_type: getCataractType() as any,
          cataract_laterality: diagnosis.cataractLaterality || null,
          pterygium: diagnosis.pterygium,
          pterygium_laterality: diagnosis.pterygiumLaterality || null,
          refraction_error: diagnosis.refractionError,
          refraction_laterality: diagnosis.refractionLaterality || null,
          refraction_notes: diagnosis.refractionNotes || null,
          other_diagnosis: diagnosis.otherDiagnosis || null,
          other_laterality: diagnosis.otherLaterality || null,
        };

        if (existingDiagnosis) {
          const { error } = await supabase
            .from('diagnoses')
            .update(diagnosisData)
            .eq('id', existingDiagnosis.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('diagnoses')
            .insert(diagnosisData);

          if (error) throw error;
        }
      }

      toast({
        title: 'Success',
        description: 'Patient information saved successfully',
      });
    } catch (error) {
      console.error('Error saving patient data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save patient information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 md:px-10 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {patientData.lastname && patientData.firstname
                ? `${patientData.lastname}, ${patientData.firstname}`
                : 'Patient Information'}
            </h1>
            {patientData.patient_id && (
              <p className="text-xs text-gray-500">
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
              className={`px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
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
        <div className="max-w-6xl mx-auto">
          {/* INFO & HISTORY Tab */}
          {activeTab === 'InfoHistory' && (
            <div className="space-y-4">
              {/* Patient Identification */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Patient Identification</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Demographics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-sm"
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
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div className="mt-3">
                  <Input
                    label="Address"
                    value={patientData.address || ''}
                    onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
                    fullWidth
                  />
                </div>
              </div>

              {/* PhilHealth Information */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3">PhilHealth Information</h2>
                <div className="space-y-3">
                  <Switch
                    checked={patientData.philhealth_member || false}
                    onChange={(checked) => setPatientData({ ...patientData, philhealth_member: checked })}
                    label="PhilHealth Member"
                  />
                  
                  {patientData.philhealth_member && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-sm"
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
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Chief Complaint</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Ocular History</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Past Medical History</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Previous Surgeries</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  {(patientData.previous_surgery_od || patientData.previous_surgery_os) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Surgery Notes
                      </label>
                      <textarea
                        value={patientData.previous_surgery_notes || ''}
                        onChange={(e) => setPatientData({ ...patientData, previous_surgery_notes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="Details about previous surgeries..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VISUAL ACUITY Tab */}
          {activeTab === 'VisualAcuity' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Visual Acuity Examination</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowPreviousResults(true)}
                  size="sm"
                >
                  VIEW PREVIOUS RESULTS
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OD (Right Eye) Column */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 bg-blue-50 p-2 rounded">OD (Right Eye)</h3>
                  
                  {/* Visual Acuity Near - OD */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Visual Acuity (Near)</h4>
                    <div className="space-y-2">
                      <Input label="OD" value={visualAcuity.nearOd} onChange={(e) => setVisualAcuity({...visualAcuity, nearOd: e.target.value})} fullWidth size="sm" />
                      <Input label="BC" value={visualAcuity.nearOdBc} onChange={(e) => setVisualAcuity({...visualAcuity, nearOdBc: e.target.value})} fullWidth size="sm" />
                      <Input label="PH" value={visualAcuity.nearOdPh} onChange={(e) => setVisualAcuity({...visualAcuity, nearOdPh: e.target.value})} fullWidth size="sm" />
                      <Input label="AR" value={visualAcuity.nearOdAr} onChange={(e) => setVisualAcuity({...visualAcuity, nearOdAr: e.target.value})} fullWidth size="sm" />
                      <Input label="K1" value={visualAcuity.nearOdK1} onChange={(e) => setVisualAcuity({...visualAcuity, nearOdK1: e.target.value})} fullWidth size="sm" />
                      <Input label="K2" value={visualAcuity.nearOdK2} onChange={(e) => setVisualAcuity({...visualAcuity, nearOdK2: e.target.value})} fullWidth size="sm" />
                      <Input label="Axl Length" value={visualAcuity.nearOdAxl} onChange={(e) => setVisualAcuity({...visualAcuity, nearOdAxl: e.target.value})} fullWidth size="sm" />
                    </div>
                  </div>

                  {/* Visual Acuity Distance - OD */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Visual Acuity (Distance)</h4>
                    <div className="space-y-2">
                      <Input label="OD" value={visualAcuity.distOd} onChange={(e) => setVisualAcuity({...visualAcuity, distOd: e.target.value})} fullWidth size="sm" />
                      <Input label="BC" value={visualAcuity.distOdBc} onChange={(e) => setVisualAcuity({...visualAcuity, distOdBc: e.target.value})} fullWidth size="sm" />
                      <Input label="PH" value={visualAcuity.distOdPh} onChange={(e) => setVisualAcuity({...visualAcuity, distOdPh: e.target.value})} fullWidth size="sm" />
                      <Input label="K1" value={visualAcuity.distOdK1} onChange={(e) => setVisualAcuity({...visualAcuity, distOdK1: e.target.value})} fullWidth size="sm" />
                      <Input label="K2" value={visualAcuity.distOdK2} onChange={(e) => setVisualAcuity({...visualAcuity, distOdK2: e.target.value})} fullWidth size="sm" />
                      <Input label="Axl Length" value={visualAcuity.distOdAxl} onChange={(e) => setVisualAcuity({...visualAcuity, distOdAxl: e.target.value})} fullWidth size="sm" />
                    </div>
                  </div>
                </div>

                {/* OS (Left Eye) Column */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 bg-green-50 p-2 rounded">OS (Left Eye)</h3>
                  
                  {/* Visual Acuity Near - OS */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Visual Acuity (Near)</h4>
                    <div className="space-y-2">
                      <Input label="OS" value={visualAcuity.nearOs} onChange={(e) => setVisualAcuity({...visualAcuity, nearOs: e.target.value})} fullWidth size="sm" />
                      <Input label="BC" value={visualAcuity.nearOsBc} onChange={(e) => setVisualAcuity({...visualAcuity, nearOsBc: e.target.value})} fullWidth size="sm" />
                      <Input label="PH" value={visualAcuity.nearOsPh} onChange={(e) => setVisualAcuity({...visualAcuity, nearOsPh: e.target.value})} fullWidth size="sm" />
                      <Input label="AR" value={visualAcuity.nearOsAr} onChange={(e) => setVisualAcuity({...visualAcuity, nearOsAr: e.target.value})} fullWidth size="sm" />
                      <Input label="K1" value={visualAcuity.nearOsK1} onChange={(e) => setVisualAcuity({...visualAcuity, nearOsK1: e.target.value})} fullWidth size="sm" />
                      <Input label="K2" value={visualAcuity.nearOsK2} onChange={(e) => setVisualAcuity({...visualAcuity, nearOsK2: e.target.value})} fullWidth size="sm" />
                      <Input label="Axl Length" value={visualAcuity.nearOsAxl} onChange={(e) => setVisualAcuity({...visualAcuity, nearOsAxl: e.target.value})} fullWidth size="sm" />
                    </div>
                  </div>

                  {/* Visual Acuity Distance - OS */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Visual Acuity (Distance)</h4>
                    <div className="space-y-2">
                      <Input label="OS" value={visualAcuity.distOs} onChange={(e) => setVisualAcuity({...visualAcuity, distOs: e.target.value})} fullWidth size="sm" />
                      <Input label="BC" value={visualAcuity.distOsBc} onChange={(e) => setVisualAcuity({...visualAcuity, distOsBc: e.target.value})} fullWidth size="sm" />
                      <Input label="PH" value={visualAcuity.distOsPh} onChange={(e) => setVisualAcuity({...visualAcuity, distOsPh: e.target.value})} fullWidth size="sm" />
                      <Input label="K1" value={visualAcuity.distOsK1} onChange={(e) => setVisualAcuity({...visualAcuity, distOsK1: e.target.value})} fullWidth size="sm" />
                      <Input label="K2" value={visualAcuity.distOsK2} onChange={(e) => setVisualAcuity({...visualAcuity, distOsK2: e.target.value})} fullWidth size="sm" />
                      <Input label="Axl Length" value={visualAcuity.distOsAxl} onChange={(e) => setVisualAcuity({...visualAcuity, distOsAxl: e.target.value})} fullWidth size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANTERIOR SEGMENT Tab */}
          {activeTab === 'AnteriorSegment' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Anterior Segment Examination</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OD Drawing */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">OD (Right Eye)</h3>
                  <SignaturePad
                    onSave={(data) => setAnteriorSegment({...anteriorSegment, odDrawing: data})}
                    onClear={() => setAnteriorSegment({...anteriorSegment, odDrawing: ''})}
                    initialSignature={anteriorSegment.odDrawing}
                  />
                </div>

                {/* OS Drawing */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">OS (Left Eye)</h3>
                  <SignaturePad
                    onSave={(data) => setAnteriorSegment({...anteriorSegment, osDrawing: data})}
                    onClear={() => setAnteriorSegment({...anteriorSegment, osDrawing: ''})}
                    initialSignature={anteriorSegment.osDrawing}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SLIT LAMP Tab */}
          {activeTab === 'SlitLamp' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Slit Lamp Examination</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OD Findings */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">OD (Right Eye)</h3>
                  <textarea
                    value={slitLamp.od}
                    onChange={(e) => setSlitLamp({...slitLamp, od: e.target.value})}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Enter findings for OD..."
                  />
                </div>

                {/* OS Findings */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">OS (Left Eye)</h3>
                  <textarea
                    value={slitLamp.os}
                    onChange={(e) => setSlitLamp({...slitLamp, os: e.target.value})}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Enter findings for OS..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* FUNDUS Tab */}
          {activeTab === 'Fundus' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Fundus Examination</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OD Findings */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">OD (Right Eye)</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cup-to-Disc Ratio
                      </label>
                      <Input
                        value={fundus.cupDiscRatioOd}
                        onChange={(e) => setFundus({...fundus, cupDiscRatioOd: e.target.value})}
                        placeholder="e.g., 0.3"
                        fullWidth
                        size="sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Findings
                      </label>
                      <textarea
                        value={fundus.od}
                        onChange={(e) => setFundus({...fundus, od: e.target.value})}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="Enter findings for OD..."
                      />
                    </div>
                  </div>
                </div>

                {/* OS Findings */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">OS (Left Eye)</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cup-to-Disc Ratio
                      </label>
                      <Input
                        value={fundus.cupDiscRatioOs}
                        onChange={(e) => setFundus({...fundus, cupDiscRatioOs: e.target.value})}
                        placeholder="e.g., 0.3"
                        fullWidth
                        size="sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Findings
                      </label>
                      <textarea
                        value={fundus.os}
                        onChange={(e) => setFundus({...fundus, os: e.target.value})}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="Enter findings for OS..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DIAGNOSIS Tab */}
          {activeTab === 'Diagnosis' && (
            <div className="space-y-4">
              {/* Pseudophakia */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={diagnosis.pseudophakia}
                    onChange={(e) => setDiagnosis({ ...diagnosis, pseudophakia: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <h3 className="text-base font-semibold text-gray-900">Pseudophakia</h3>
                </div>
                {diagnosis.pseudophakia && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
                    <EyeSelector
                      value={diagnosis.pseudophakiaLaterality}
                      onChange={(value) => setDiagnosis({ ...diagnosis, pseudophakiaLaterality: value })}
                      label="Affected Eye"
                    />
                    <Input
                      label="IOL Details"
                      value={diagnosis.pseudophakiaIol}
                      onChange={(e) => setDiagnosis({ ...diagnosis, pseudophakiaIol: e.target.value })}
                      fullWidth
                    />
                  </div>
                )}
              </div>

              {/* Cataract */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={diagnosis.cataract}
                    onChange={(e) => setDiagnosis({ ...diagnosis, cataract: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <h3 className="text-base font-semibold text-gray-900">Cataract</h3>
                </div>
                {diagnosis.cataract && (
                  <div className="space-y-3 pl-7">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                      value={diagnosis.cataractLaterality}
                      onChange={(value) => setDiagnosis({ ...diagnosis, cataractLaterality: value })}
                      label="Affected Eye"
                    />
                  </div>
                )}
              </div>

              {/* Pterygium */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={diagnosis.pterygium}
                    onChange={(e) => setDiagnosis({ ...diagnosis, pterygium: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <h3 className="text-base font-semibold text-gray-900">Pterygium</h3>
                </div>
                {diagnosis.pterygium && (
                  <div className="pl-7">
                    <EyeSelector
                      value={diagnosis.pterygiumLaterality}
                      onChange={(value) => setDiagnosis({ ...diagnosis, pterygiumLaterality: value })}
                      label="Affected Eye"
                    />
                  </div>
                )}
              </div>

              {/* Refraction Error */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={diagnosis.refractionError}
                    onChange={(e) => setDiagnosis({ ...diagnosis, refractionError: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <h3 className="text-base font-semibold text-gray-900">Refraction Error</h3>
                </div>
                {diagnosis.refractionError && (
                  <div className="space-y-3 pl-7">
                    <EyeSelector
                      value={diagnosis.refractionLaterality}
                      onChange={(value) => setDiagnosis({ ...diagnosis, refractionLaterality: value })}
                      label="Affected Eye"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={diagnosis.refractionNotes}
                        onChange={(e) => setDiagnosis({ ...diagnosis, refractionNotes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Other Diagnosis */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={diagnosis.other}
                    onChange={(e) => setDiagnosis({ ...diagnosis, other: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <h3 className="text-base font-semibold text-gray-900">Other Diagnosis</h3>
                </div>
                {diagnosis.other && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
                    <Input
                      label="Diagnosis"
                      value={diagnosis.otherDiagnosis}
                      onChange={(e) => setDiagnosis({ ...diagnosis, otherDiagnosis: e.target.value })}
                      fullWidth
                    />
                    <EyeSelector
                      value={diagnosis.otherLaterality}
                      onChange={(value) => setDiagnosis({ ...diagnosis, otherLaterality: value })}
                      label="Affected Eye"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BIOMETRY Tab */}
          {activeTab === 'Biometry' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Biometry Measurements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OD Measurements */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">OD (Right Eye)</h3>
                  <div className="space-y-3">
                    <Input label="K1" value={biometry.odK1} onChange={(e) => setBiometry({...biometry, odK1: e.target.value})} fullWidth />
                    <Input label="K2" value={biometry.odK2} onChange={(e) => setBiometry({...biometry, odK2: e.target.value})} fullWidth />
                    <Input label="AL (Axial Length)" value={biometry.odAl} onChange={(e) => setBiometry({...biometry, odAl: e.target.value})} fullWidth />
                    <Input label="ACD (Anterior Chamber Depth)" value={biometry.odAcd} onChange={(e) => setBiometry({...biometry, odAcd: e.target.value})} fullWidth />
                  </div>
                </div>

                {/* OS Measurements */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">OS (Left Eye)</h3>
                  <div className="space-y-3">
                    <Input label="K1" value={biometry.osK1} onChange={(e) => setBiometry({...biometry, osK1: e.target.value})} fullWidth />
                    <Input label="K2" value={biometry.osK2} onChange={(e) => setBiometry({...biometry, osK2: e.target.value})} fullWidth />
                    <Input label="AL (Axial Length)" value={biometry.osAl} onChange={(e) => setBiometry({...biometry, osAl: e.target.value})} fullWidth />
                    <Input label="ACD (Anterior Chamber Depth)" value={biometry.osAcd} onChange={(e) => setBiometry({...biometry, osAcd: e.target.value})} fullWidth />
                  </div>
                </div>
              </div>

              {/* IOL Power Calculation */}
              <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">IOL Power Calculation</h3>
                <p className="text-sm text-gray-500">IOL power will be automatically calculated based on biometry measurements</p>
              </div>
            </div>
          )}

          {/* CLEARANCE Tab */}
          {activeTab === 'Clearance' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Clearance</h2>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Upload Clearance Documents</h3>
                <FileUpload
                  label="Medical Clearance Documents"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFileSelect={(file) => console.log('File selected:', file)}
                />
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clearance Notes
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Additional clearance notes..."
                  />
                </div>
              </div>

              {/* Surgery Scheduling */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Surgery Scheduling</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="date"
                      label="Scheduled Date"
                      value={surgerySchedule.scheduledDate}
                      onChange={(e) => setSurgerySchedule({ ...surgerySchedule, scheduledDate: e.target.value })}
                      fullWidth
                    />
                    <Input
                      type="time"
                      label="Scheduled Time"
                      value={surgerySchedule.scheduledTime}
                      onChange={(e) => setSurgerySchedule({ ...surgerySchedule, scheduledTime: e.target.value })}
                      fullWidth
                    />
                  </div>
                  <Input
                    label="Procedure"
                    value={surgerySchedule.procedure}
                    onChange={(e) => setSurgerySchedule({ ...surgerySchedule, procedure: e.target.value })}
                    fullWidth
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <EyeSelector
                      value={surgerySchedule.eyeOperated}
                      onChange={(value) => setSurgerySchedule({ ...surgerySchedule, eyeOperated: value })}
                      label="Eye to be Operated"
                    />
                    <Input
                      label="IOL Power"
                      value={surgerySchedule.iolPower}
                      onChange={(e) => setSurgerySchedule({ ...surgerySchedule, iolPower: e.target.value })}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Navigation Buttons */}
      <div className="bg-white border-t px-6 md:px-10 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              size="sm"
            >
              × Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handlePrevTab}
              disabled={activeTab === 'InfoHistory'}
              size="sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              BACK
            </Button>
          </div>
          <div className="flex gap-2">
            {activeTab !== 'Clearance' ? (
              <Button
                onClick={handleNextTab}
                size="sm"
              >
                NEXT
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSavePatientInfo}
                loading={loading}
                size="sm"
              >
                SUBMIT
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Previous Results Modal */}
      <Modal
        isOpen={showPreviousResults}
        onClose={() => setShowPreviousResults(false)}
        title="Previous Visual Acuity Results"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">No previous results found for this patient.</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Previous examination results will appear here once data is available.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default InformationPage;
