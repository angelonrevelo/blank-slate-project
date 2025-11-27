import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import { Button, Input, Switch, EyeSelector, FileUpload, Modal, WebCameraCapture, ImagePainter, IOLSelectionTable } from '@/components/ui';
import { ArrowLeft, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
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
  patient_photo_url?: string;
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
  const [showCameraModal, setShowCameraModal] = useState(false);
  
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

  const [patientPhoto, setPatientPhoto] = useState<string>('');

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

  // Anterior Segment state (drawings)
  const [anteriorSegment, setAnteriorSegment] = useState({
    odDrawing: '',
    osDrawing: '',
  });

  // Slit Lamp state
  const [slitLamp, setSlitLamp] = useState({
    od: '',
    os: '',
    odDrawing: '',
    osDrawing: '',
  });

  // Fundus state
  const [fundus, setFundus] = useState({
    od: '',
    os: '',
    cupDiscRatioOd: '',
    cupDiscRatioOs: '',
    odDrawing: '',
    osDrawing: '',
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

  // Biometry state
  const [biometry, setBiometry] = useState({
    odK1: '',
    odK2: '',
    odAl: '',
    odAcd: '',
    osK1: '',
    osK2: '',
    osAl: '',
    osAcd: '',
  });

  // IOL Powers state
  const [iolPowers, setIolPowers] = useState({
    OD_A1: '', OD_A2: '', OD_A3: '', OD_A4: '', OD_A5: '',
    OD_B1: '', OD_B2: '', OD_B3: '', OD_B4: '', OD_B5: '',
    OS_A1: '', OS_A2: '', OS_A3: '', OS_A4: '', OS_A5: '',
    OS_B1: '', OS_B2: '', OS_B3: '', OS_B4: '', OS_B5: '',
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

  // Treatment Plan state
  const [treatmentPlan, setTreatmentPlan] = useState({
    forbiometry: false,
    forbiometryNotes: '',
    forva: false,
    forvaNotes: '',
    forsurgery: false,
    surgeryEye: '' as 'OD' | 'OS' | 'OU' | '',
    forsurgeryNotes: '',
    postponesurgery: false,
    postponeDate: '',
    postponeNotes: '',
    requiresclearance: false,
    clearanceNotes: '',
    torefer: false,
    referDoctor: '',
    referNotes: '',
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

  // SRK-T Formula for IOL calculation (simplified)
  const calculateIOL = (k1: number, k2: number, al: number): number[] => {
    const kAvg = (k1 + k2) / 2;
    const A = 118.4; // A-constant (typical value, can be adjusted)
    
    const results: number[] = [];
    for (let targetRefraction = -1; targetRefraction <= 1; targetRefraction += 0.5) {
      const iol = A - 2.5 * al - 0.9 * kAvg + targetRefraction;
      results.push(Math.round(iol * 2) / 2); // Round to nearest 0.5
    }
    
    return results;
  };

  const handlePhotoCapture = (base64Image: string) => {
    setPatientPhoto(base64Image);
    setShowCameraModal(false);
    toast({
      title: 'Success',
      description: 'Patient photo captured successfully',
    });
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
            patient_photo_url: patient.patient_photo_url || '',
          });
          
          if (patient.patient_photo_url) {
            setPatientPhoto(patient.patient_photo_url);
          }
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
              odDrawing: '',
              osDrawing: '',
            });

            setFundus({
              od: exam.fundus_od || '',
              os: exam.fundus_os || '',
              cupDiscRatioOd: exam.cup_disc_ratio_od || '',
              cupDiscRatioOs: exam.cup_disc_ratio_os || '',
              odDrawing: '',
              osDrawing: '',
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

          // Fetch followup/treatment plan data if followupId exists
          if (followupId) {
            const { data: followupData } = await supabase
              .from('followups')
              .select('*')
              .eq('id', followupId)
              .single();

            if (followupData) {
              setTreatmentPlan({
                forbiometry: followupData.forbiometry || false,
                forbiometryNotes: followupData.forbiometrynotes || '',
                forva: followupData.forva || false,
                forvaNotes: followupData.forvanotes || '',
                forsurgery: followupData.forsurgery || false,
                surgeryEye: (followupData.surgeryeye || '') as any,
                forsurgeryNotes: followupData.forsurgerynotes || '',
                postponesurgery: followupData.postponesurgery || false,
                postponeDate: followupData.returndate || '',
                postponeNotes: followupData.notes || '',
                requiresclearance: false,
                clearanceNotes: '',
                torefer: followupData.torefer || false,
                referDoctor: followupData.toreferdoctor || '',
                referNotes: followupData.torefernotes || '',
                graduated: followupData.graduated || false,
                graduatedNotes: followupData.graduatednotes || '',
              });
            }
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

  // Auto-calculate IOL powers when biometry data changes
  useEffect(() => {
    if (biometry.odK1 && biometry.odK2 && biometry.odAl) {
      const iolOptions = calculateIOL(
        parseFloat(biometry.odK1),
        parseFloat(biometry.odK2),
        parseFloat(biometry.odAl)
      );
      setIolPowers(prev => ({
        ...prev,
        OD_A1: iolOptions[0]?.toString() || '',
        OD_A2: iolOptions[1]?.toString() || '',
        OD_A3: iolOptions[2]?.toString() || '',
        OD_A4: iolOptions[3]?.toString() || '',
        OD_A5: iolOptions[4]?.toString() || '',
      }));
    }
    
    if (biometry.osK1 && biometry.osK2 && biometry.osAl) {
      const iolOptions = calculateIOL(
        parseFloat(biometry.osK1),
        parseFloat(biometry.osK2),
        parseFloat(biometry.osAl)
      );
      setIolPowers(prev => ({
        ...prev,
        OS_A1: iolOptions[0]?.toString() || '',
        OS_A2: iolOptions[1]?.toString() || '',
        OS_A3: iolOptions[2]?.toString() || '',
        OS_A4: iolOptions[3]?.toString() || '',
        OS_A5: iolOptions[4]?.toString() || '',
      }));
    }
  }, [biometry]);

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
            patient_photo_url: patientPhoto || null,
          })
          .eq('id', savedPatientId);

        if (error) throw error;
      } else {
        // Create new patient - use RPC function to generate patient ID
        const { data: generatedId, error: rpcError } = await supabase
          .rpc('get_next_patient_id', { p_branch: viewingBranch });

        if (rpcError) throw rpcError;

        const { data: newPatient, error } = await supabase
          .from('patients')
          .insert({
            patient_id: generatedId,
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
            patient_photo_url: patientPhoto || null,
            branch: viewingBranch,
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        savedPatientId = newPatient.id;
        setPatientData({ ...patientData, id: savedPatientId, patient_id: generatedId });
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

        // Save treatment plan as followup if there are any selections
        const hasTreatmentPlan = treatmentPlan.forbiometry || treatmentPlan.forva || treatmentPlan.forsurgery || 
          treatmentPlan.postponesurgery || treatmentPlan.torefer || treatmentPlan.graduated;

        if (hasTreatmentPlan && savedPatientId && savedIntakeId) {
          if (followupId) {
            // Update existing followup
            const { error } = await supabase
              .from('followups')
              .update({
                forbiometry: treatmentPlan.forbiometry,
                forbiometrynotes: treatmentPlan.forbiometryNotes || null,
                forva: treatmentPlan.forva,
                forvanotes: treatmentPlan.forvaNotes || null,
                forsurgery: treatmentPlan.forsurgery,
                surgeryeye: treatmentPlan.surgeryEye || null,
                forsurgerynotes: treatmentPlan.forsurgeryNotes || null,
                postponesurgery: treatmentPlan.postponesurgery,
                returndate: treatmentPlan.postponeDate || null,
                notes: treatmentPlan.postponeNotes || null,
                torefer: treatmentPlan.torefer,
                toreferdoctor: treatmentPlan.referDoctor || null,
                torefernotes: treatmentPlan.referNotes || null,
                graduated: treatmentPlan.graduated,
                graduatednotes: treatmentPlan.graduatedNotes || null,
              })
              .eq('id', followupId);

            if (error) throw error;
          } else {
            // Create new followup
            const { error } = await supabase
              .from('followups')
              .insert({
                patient_id: savedPatientId,
                intake_id: savedIntakeId,
                branch: viewingBranch,
                followup_date: new Date().toISOString().split('T')[0],
                forbiometry: treatmentPlan.forbiometry,
                forbiometrynotes: treatmentPlan.forbiometryNotes || null,
                forva: treatmentPlan.forva,
                forvanotes: treatmentPlan.forvaNotes || null,
                forsurgery: treatmentPlan.forsurgery,
                surgeryeye: treatmentPlan.surgeryEye || null,
                forsurgerynotes: treatmentPlan.forsurgeryNotes || null,
                postponesurgery: treatmentPlan.postponesurgery,
                returndate: treatmentPlan.postponeDate || null,
                notes: treatmentPlan.postponeNotes || null,
                torefer: treatmentPlan.torefer,
                toreferdoctor: treatmentPlan.referDoctor || null,
                torefernotes: treatmentPlan.referNotes || null,
                graduated: treatmentPlan.graduated,
                graduatednotes: treatmentPlan.graduatedNotes || null,
              });

            if (error) throw error;
          }
        }
      }

      toast({
        title: 'Success',
        description: 'Patient information saved successfully',
      });
      
      navigate(-1);
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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 md:px-8 py-2.5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              {patientData.lastname && patientData.firstname
                ? `${patientData.lastname}, ${patientData.firstname}`
                : 'Patient Information'}
            </h1>
            {patientData.patient_id && (
              <p className="text-xs text-muted-foreground">
                Patient ID: {patientData.patient_id}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 md:px-8 bg-card border-b">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* INFO & HISTORY Tab */}
          {activeTab === 'InfoHistory' && (
            <div className="space-y-4">
              {/* Patient Photo */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3">Patient Photo</h2>
                <div className="flex items-center gap-4">
                  {patientPhoto ? (
                    <div className="relative">
                      <img 
                        src={patientPhoto} 
                        alt="Patient" 
                        className="w-32 h-32 rounded-lg object-cover border-2 border-border"
                      />
                      <button
                        onClick={() => setPatientPhoto('')}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-destructive/90"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCameraModal(true)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {patientPhoto ? 'Retake Photo' : 'Capture Photo'}
                  </Button>
                </div>
              </div>

              {/* Patient Identification */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3">Patient Identification</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    label="Patient ID"
                    value={patientData.patient_id || ''}
                    onChange={(e) => setPatientData({ ...patientData, patient_id: e.target.value })}
                    fullWidth
                    size="sm"
                    disabled
                  />
                  <Input
                    label="Last Name"
                    value={patientData.lastname || ''}
                    onChange={(e) => setPatientData({ ...patientData, lastname: e.target.value })}
                    required
                    fullWidth
                    size="sm"
                  />
                  <Input
                    label="First Name"
                    value={patientData.firstname || ''}
                    onChange={(e) => setPatientData({ ...patientData, firstname: e.target.value })}
                    required
                    fullWidth
                    size="sm"
                  />
                  <Input
                    label="Middle Name"
                    value={patientData.middlename || ''}
                    onChange={(e) => setPatientData({ ...patientData, middlename: e.target.value })}
                    fullWidth
                    size="sm"
                  />
                </div>
              </div>

              {/* Demographics */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3">Demographics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    type="date"
                    label="Date of Birth"
                    value={patientData.birthdate || ''}
                    onChange={(e) => setPatientData({ ...patientData, birthdate: e.target.value })}
                    required
                    fullWidth
                    size="sm"
                  />
                  <Input
                    label="Age"
                    value={patientData.birthdate ? calculateAge(patientData.birthdate).toString() : ''}
                    disabled
                    fullWidth
                    size="sm"
                  />
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Gender <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={patientData.gender || ''}
                      onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Civil Status
                    </label>
                    <select
                      value={patientData.civil_status || ''}
                      onChange={(e) => setPatientData({ ...patientData, civil_status: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
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
              <div className="bg-card rounded-lg shadow-sm p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Contact Number"
                    value={patientData.contact_number || ''}
                    onChange={(e) => setPatientData({ ...patientData, contact_number: e.target.value })}
                    fullWidth
                    size="sm"
                  />
                  <Input
                    label="Referred By"
                    value={patientData.referred_by || ''}
                    onChange={(e) => setPatientData({ ...patientData, referred_by: e.target.value })}
                    fullWidth
                    size="sm"
                  />
                </div>
                <div className="mt-3">
                  <Input
                    label="Address"
                    value={patientData.address || ''}
                    onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
                    fullWidth
                    size="sm"
                  />
                </div>
              </div>

              {/* PhilHealth Information */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3">PhilHealth Information</h2>
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
                        size="sm"
                      />
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          Category
                        </label>
                        <select
                          value={patientData.philhealth_category || ''}
                          onChange={(e) => setPatientData({ ...patientData, philhealth_category: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
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
              <div className="bg-card rounded-lg shadow-sm p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3">Chief Complaint</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(chiefComplaints).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setChiefComplaints({ ...chiefComplaints, [key]: e.target.checked })}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                      />
                      <span className="text-xs text-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ocular History */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3">Ocular History</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(ocularHistory).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setOcularHistory({ ...ocularHistory, [key]: e.target.checked })}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                      />
                      <span className="text-xs text-foreground capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Past Medical History */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3">Past Medical History</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(pastMedicalHistory).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setPastMedicalHistory({ ...pastMedicalHistory, [key]: e.target.checked })}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                      />
                      <span className="text-xs text-foreground capitalize">
                        {key === 'hpn' ? 'HPN' : key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Previous Eye Surgery */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3">Previous Eye Surgery</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Switch
                        checked={patientData.previous_surgery_od || false}
                        onChange={(checked) => setPatientData({ ...patientData, previous_surgery_od: checked })}
                        label="OD (Right Eye)"
                      />
                      {patientData.previous_surgery_od && (
                        <Input
                          type="date"
                          label="Surgery Date"
                          value={patientData.previous_surgery_od_date || ''}
                          onChange={(e) => setPatientData({ ...patientData, previous_surgery_od_date: e.target.value })}
                          fullWidth
                          size="sm"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Switch
                        checked={patientData.previous_surgery_os || false}
                        onChange={(checked) => setPatientData({ ...patientData, previous_surgery_os: checked })}
                        label="OS (Left Eye)"
                      />
                      {patientData.previous_surgery_os && (
                        <Input
                          type="date"
                          label="Surgery Date"
                          value={patientData.previous_surgery_os_date || ''}
                          onChange={(e) => setPatientData({ ...patientData, previous_surgery_os_date: e.target.value })}
                          fullWidth
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                  {(patientData.previous_surgery_od || patientData.previous_surgery_os) && (
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        Surgery Notes
                      </label>
                      <textarea
                        value={patientData.previous_surgery_notes || ''}
                        onChange={(e) => setPatientData({ ...patientData, previous_surgery_notes: e.target.value })}
                        rows={3}
                        className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
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
                <h2 className="text-base font-semibold text-foreground">Visual Acuity Examination</h2>
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
                  <h3 className="text-sm font-semibold text-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded">OD (Right Eye)</h3>
                  
                  {/* Visual Acuity Near - OD */}
                  <div className="bg-card rounded-lg shadow-sm p-3">
                    <h4 className="text-xs font-semibold text-foreground mb-2">Visual Acuity (Near)</h4>
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
                  <div className="bg-card rounded-lg shadow-sm p-3">
                    <h4 className="text-xs font-semibold text-foreground mb-2">Visual Acuity (Distance)</h4>
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
                  <h3 className="text-sm font-semibold text-foreground bg-green-50 dark:bg-green-950 p-2 rounded">OS (Left Eye)</h3>
                  
                  {/* Visual Acuity Near - OS */}
                  <div className="bg-card rounded-lg shadow-sm p-3">
                    <h4 className="text-xs font-semibold text-foreground mb-2">Visual Acuity (Near)</h4>
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
                  <div className="bg-card rounded-lg shadow-sm p-3">
                    <h4 className="text-xs font-semibold text-foreground mb-2">Visual Acuity (Distance)</h4>
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
              <h2 className="text-base font-semibold text-foreground mb-4">Anterior Segment Examination</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OD Drawing */}
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">OD (Right Eye)</h3>
                  <ImagePainter
                    width={400}
                    height={400}
                    onSave={(dataUrl) => setAnteriorSegment({...anteriorSegment, odDrawing: dataUrl})}
                    initialData={anteriorSegment.odDrawing}
                  />
                </div>

                {/* OS Drawing */}
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">OS (Left Eye)</h3>
                  <ImagePainter
                    width={400}
                    height={400}
                    onSave={(dataUrl) => setAnteriorSegment({...anteriorSegment, osDrawing: dataUrl})}
                    initialData={anteriorSegment.osDrawing}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SLIT LAMP Tab */}
          {activeTab === 'SlitLamp' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground mb-4">Slit Lamp Examination</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OD Findings */}
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">OD (Right Eye)</h3>
                  <textarea
                    value={slitLamp.od}
                    onChange={(e) => setSlitLamp({...slitLamp, od: e.target.value})}
                    rows={10}
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                    placeholder="Enter findings for OD..."
                  />
                </div>

                {/* OS Findings */}
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">OS (Left Eye)</h3>
                  <textarea
                    value={slitLamp.os}
                    onChange={(e) => setSlitLamp({...slitLamp, os: e.target.value})}
                    rows={10}
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                    placeholder="Enter findings for OS..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* FUNDUS Tab */}
          {activeTab === 'Fundus' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground mb-4">Fundus Examination</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OD Findings */}
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">OD (Right Eye)</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
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
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        Findings
                      </label>
                      <textarea
                        value={fundus.od}
                        onChange={(e) => setFundus({...fundus, od: e.target.value})}
                        rows={8}
                        className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                        placeholder="Enter findings for OD..."
                      />
                    </div>
                  </div>
                </div>

                {/* OS Findings */}
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">OS (Left Eye)</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
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
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        Findings
                      </label>
                      <textarea
                        value={fundus.os}
                        onChange={(e) => setFundus({...fundus, os: e.target.value})}
                        rows={8}
                        className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
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
              <div className="bg-card rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={diagnosis.pseudophakia}
                    onChange={(e) => setDiagnosis({ ...diagnosis, pseudophakia: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <h3 className="text-sm font-semibold text-foreground">Pseudophakia</h3>
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
                      size="sm"
                    />
                  </div>
                )}
              </div>

              {/* Cataract */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={diagnosis.cataract}
                    onChange={(e) => setDiagnosis({ ...diagnosis, cataract: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <h3 className="text-sm font-semibold text-foreground">Cataract</h3>
                </div>
                {diagnosis.cataract && (
                  <div className="space-y-3 pl-7">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Type</label>
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
                              className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                            />
                            <span className="text-xs text-foreground capitalize">{key}</span>
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
              <div className="bg-card rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={diagnosis.pterygium}
                    onChange={(e) => setDiagnosis({ ...diagnosis, pterygium: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <h3 className="text-sm font-semibold text-foreground">Pterygium</h3>
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
              <div className="bg-card rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={diagnosis.refractionError}
                    onChange={(e) => setDiagnosis({ ...diagnosis, refractionError: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <h3 className="text-sm font-semibold text-foreground">Refraction Error</h3>
                </div>
                {diagnosis.refractionError && (
                  <div className="space-y-3 pl-7">
                    <EyeSelector
                      value={diagnosis.refractionLaterality}
                      onChange={(value) => setDiagnosis({ ...diagnosis, refractionLaterality: value })}
                      label="Affected Eye"
                    />
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Notes</label>
                      <textarea
                        value={diagnosis.refractionNotes}
                        onChange={(e) => setDiagnosis({ ...diagnosis, refractionNotes: e.target.value })}
                        rows={3}
                        className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Other Diagnosis */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={diagnosis.other}
                    onChange={(e) => setDiagnosis({ ...diagnosis, other: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <h3 className="text-sm font-semibold text-foreground">Other Diagnosis</h3>
                </div>
                {diagnosis.other && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
                    <Input
                      label="Diagnosis"
                      value={diagnosis.otherDiagnosis}
                      onChange={(e) => setDiagnosis({ ...diagnosis, otherDiagnosis: e.target.value })}
                      fullWidth
                      size="sm"
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
              <h2 className="text-base font-semibold text-foreground mb-4">Biometry Measurements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OD Measurements */}
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">OD (Right Eye)</h3>
                  <div className="space-y-3">
                    <Input label="K1" value={biometry.odK1} onChange={(e) => setBiometry({...biometry, odK1: e.target.value})} fullWidth size="sm" />
                    <Input label="K2" value={biometry.odK2} onChange={(e) => setBiometry({...biometry, odK2: e.target.value})} fullWidth size="sm" />
                    <Input label="AL (Axial Length)" value={biometry.odAl} onChange={(e) => setBiometry({...biometry, odAl: e.target.value})} fullWidth size="sm" />
                    <Input label="ACD (Anterior Chamber Depth)" value={biometry.odAcd} onChange={(e) => setBiometry({...biometry, odAcd: e.target.value})} fullWidth size="sm" />
                  </div>
                </div>

                {/* OS Measurements */}
                <div className="bg-card rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">OS (Left Eye)</h3>
                  <div className="space-y-3">
                    <Input label="K1" value={biometry.osK1} onChange={(e) => setBiometry({...biometry, osK1: e.target.value})} fullWidth size="sm" />
                    <Input label="K2" value={biometry.osK2} onChange={(e) => setBiometry({...biometry, osK2: e.target.value})} fullWidth size="sm" />
                    <Input label="AL (Axial Length)" value={biometry.osAl} onChange={(e) => setBiometry({...biometry, osAl: e.target.value})} fullWidth size="sm" />
                    <Input label="ACD (Anterior Chamber Depth)" value={biometry.osAcd} onChange={(e) => setBiometry({...biometry, osAcd: e.target.value})} fullWidth size="sm" />
                  </div>
                </div>
              </div>

              {/* IOL Power Selection */}
              <div className="bg-card rounded-lg shadow-sm p-4 mt-4">
                <IOLSelectionTable
                  initialValues={iolPowers}
                  onChange={setIolPowers}
                />
              </div>
            </div>
          )}

          {/* CLEARANCE Tab */}
          {activeTab === 'Clearance' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground mb-4">Medical Clearance</h2>
              
              <div className="bg-card rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Upload Clearance Documents</h3>
                <FileUpload
                  label="Medical Clearance Documents"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFileSelect={(file) => console.log('File selected:', file)}
                />
                
                <div className="mt-4">
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Clearance Notes
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                    placeholder="Additional clearance notes..."
                  />
                </div>
              </div>

              {/* Surgery Scheduling */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Surgery Scheduling</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="date"
                      label="Scheduled Date"
                      value={surgerySchedule.scheduledDate}
                      onChange={(e) => setSurgerySchedule({ ...surgerySchedule, scheduledDate: e.target.value })}
                      fullWidth
                      size="sm"
                    />
                    <Input
                      type="time"
                      label="Scheduled Time"
                      value={surgerySchedule.scheduledTime}
                      onChange={(e) => setSurgerySchedule({ ...surgerySchedule, scheduledTime: e.target.value })}
                      fullWidth
                      size="sm"
                    />
                  </div>
                  <Input
                    label="Procedure"
                    value={surgerySchedule.procedure}
                    onChange={(e) => setSurgerySchedule({ ...surgerySchedule, procedure: e.target.value })}
                    fullWidth
                    size="sm"
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
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">
                      Surgery Notes
                    </label>
                    <textarea
                      value={surgerySchedule.notes}
                      onChange={(e) => setSurgerySchedule({ ...surgerySchedule, notes: e.target.value })}
                      rows={3}
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TREATMENT PLAN Tab */}
          {activeTab === 'TreatmentPlan' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-foreground mb-4">Treatment Plan</h2>

              {/* For Biometry */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={treatmentPlan.forbiometry}
                    onChange={(e) => setTreatmentPlan({ ...treatmentPlan, forbiometry: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <h3 className="text-sm font-semibold text-foreground">For Biometry Test</h3>
                </div>
                {treatmentPlan.forbiometry && (
                  <div className="pl-7">
                    <textarea
                      value={treatmentPlan.forbiometryNotes}
                      onChange={(e) => setTreatmentPlan({ ...treatmentPlan, forbiometryNotes: e.target.value })}
                      rows={3}
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                      placeholder="Notes for biometry test..."
                    />
                  </div>
                )}
              </div>

              {/* For VA */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={treatmentPlan.forva}
                    onChange={(e) => setTreatmentPlan({ ...treatmentPlan, forva: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <h3 className="text-sm font-semibold text-foreground">For Visual Acuity Retest</h3>
                </div>
                {treatmentPlan.forva && (
                  <div className="pl-7">
                    <textarea
                      value={treatmentPlan.forvaNotes}
                      onChange={(e) => setTreatmentPlan({ ...treatmentPlan, forvaNotes: e.target.value })}
                      rows={3}
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                      placeholder="Notes for VA retest..."
                    />
                  </div>
                )}
              </div>

              {/* For Surgery */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={treatmentPlan.forsurgery}
                    onChange={(e) => setTreatmentPlan({ ...treatmentPlan, forsurgery: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <h3 className="text-sm font-semibold text-foreground">For Surgery</h3>
                </div>
                {treatmentPlan.forsurgery && (
                  <div className="space-y-3 pl-7">
                    <EyeSelector
                      value={treatmentPlan.surgeryEye}
                      onChange={(value) => setTreatmentPlan({ ...treatmentPlan, surgeryEye: value })}
                      label="Surgery Eye"
                    />
                    <textarea
                      value={treatmentPlan.forsurgeryNotes}
                      onChange={(e) => setTreatmentPlan({ ...treatmentPlan, forsurgeryNotes: e.target.value })}
                      rows={3}
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                      placeholder="Surgery notes..."
                    />
                  </div>
                )}
              </div>

              {/* Postpone Surgery */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={treatmentPlan.postponesurgery}
                    onChange={(e) => setTreatmentPlan({ ...treatmentPlan, postponesurgery: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <h3 className="text-sm font-semibold text-foreground">Postpone Surgery</h3>
                </div>
                {treatmentPlan.postponesurgery && (
                  <div className="space-y-3 pl-7">
                    <Input
                      type="date"
                      label="Return Date"
                      value={treatmentPlan.postponeDate}
                      onChange={(e) => setTreatmentPlan({ ...treatmentPlan, postponeDate: e.target.value })}
                      fullWidth
                      size="sm"
                    />
                    <textarea
                      value={treatmentPlan.postponeNotes}
                      onChange={(e) => setTreatmentPlan({ ...treatmentPlan, postponeNotes: e.target.value })}
                      rows={3}
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                      placeholder="Reason for postponement..."
                    />
                  </div>
                )}
              </div>

              {/* Requires Clearance */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={treatmentPlan.requiresclearance}
                    onChange={(e) => setTreatmentPlan({ ...treatmentPlan, requiresclearance: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <h3 className="text-sm font-semibold text-foreground">Requires Medical Clearance</h3>
                </div>
                {treatmentPlan.requiresclearance && (
                  <div className="pl-7">
                    <textarea
                      value={treatmentPlan.clearanceNotes}
                      onChange={(e) => setTreatmentPlan({ ...treatmentPlan, clearanceNotes: e.target.value })}
                      rows={3}
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                      placeholder="Clearance requirements..."
                    />
                  </div>
                )}
              </div>

              {/* To Refer */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={treatmentPlan.torefer}
                    onChange={(e) => setTreatmentPlan({ ...treatmentPlan, torefer: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <h3 className="text-sm font-semibold text-foreground">Refer to Specialist</h3>
                </div>
                {treatmentPlan.torefer && (
                  <div className="space-y-3 pl-7">
                    <Input
                      label="Referring Doctor"
                      value={treatmentPlan.referDoctor}
                      onChange={(e) => setTreatmentPlan({ ...treatmentPlan, referDoctor: e.target.value })}
                      fullWidth
                      size="sm"
                    />
                    <textarea
                      value={treatmentPlan.referNotes}
                      onChange={(e) => setTreatmentPlan({ ...treatmentPlan, referNotes: e.target.value })}
                      rows={3}
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                      placeholder="Referral notes..."
                    />
                  </div>
                )}
              </div>

              {/* Graduated */}
              <div className="bg-card rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={treatmentPlan.graduated}
                    onChange={(e) => setTreatmentPlan({ ...treatmentPlan, graduated: e.target.checked })}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                  />
                  <h3 className="text-sm font-semibold text-foreground">Graduated (Treatment Complete)</h3>
                </div>
                {treatmentPlan.graduated && (
                  <div className="pl-7">
                    <textarea
                      value={treatmentPlan.graduatedNotes}
                      onChange={(e) => setTreatmentPlan({ ...treatmentPlan, graduatedNotes: e.target.value })}
                      rows={3}
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm bg-background"
                      placeholder="Final notes..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Navigation Buttons */}
      <div className="bg-card border-t px-6 md:px-8 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              size="sm"
            >
              Cancel
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
            {activeTab !== 'TreatmentPlan' ? (
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

      {/* Camera Modal */}
      <Modal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        title="Capture Patient Photo"
        size="lg"
      >
        <WebCameraCapture
          onCapture={handlePhotoCapture}
          width={640}
          height={480}
        />
      </Modal>

      {/* Previous Results Modal */}
      <Modal
        isOpen={showPreviousResults}
        onClose={() => setShowPreviousResults(false)}
        title="Previous Visual Acuity Results"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">No previous results found for this patient.</p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Previous examination results will appear here once data is available.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default InformationPage;
