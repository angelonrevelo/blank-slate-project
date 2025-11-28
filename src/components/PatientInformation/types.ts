export interface PatientData {
  id?: string;
  patient_id?: string;
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

export interface ChiefComplaints {
  blurredVision: boolean;
  eyePain: boolean;
  cloudy: boolean;
  itchy: boolean;
  floaters: boolean;
  redness: boolean;
  teary: boolean;
  headache: boolean;
  others: boolean;
}

export interface OcularHistory {
  trauma: boolean;
  glaucoma: boolean;
  retinopathy: boolean;
  cataract: boolean;
  others: boolean;
}

export interface PastMedicalHistory {
  diabetes: boolean;
  hpn: boolean;
  heartProblem: boolean;
  bloodThinner: boolean;
  others: boolean;
}

export interface VisualAcuityData {
  nearOd: string;
  nearOdBc: string;
  nearOdPh: string;
  nearOdAr: string;
  nearOdK1: string;
  nearOdK2: string;
  nearOdAxl: string;
  nearOs: string;
  nearOsBc: string;
  nearOsPh: string;
  nearOsAr: string;
  nearOsK1: string;
  nearOsK2: string;
  nearOsAxl: string;
  distOd: string;
  distOdBc: string;
  distOdPh: string;
  distOdK1: string;
  distOdK2: string;
  distOdAxl: string;
  distOs: string;
  distOsBc: string;
  distOsPh: string;
  distOsK1: string;
  distOsK2: string;
  distOsAxl: string;
}

export interface AnteriorSegmentData {
  odDrawing: string;
  osDrawing: string;
}

export interface SlitLampData {
  od: string;
  os: string;
  odDrawing: string;
  osDrawing: string;
}

export interface FundusData {
  od: string;
  os: string;
  cupDiscRatioOd: string;
  cupDiscRatioOs: string;
  odDrawing: string;
  osDrawing: string;
}

export interface DiagnosisData {
  pseudophakia: boolean;
  pseudophakiaLaterality: 'OD' | 'OS' | 'OU' | '';
  pseudophakiaIol: string;
  cataract: boolean;
  cataractType: {
    mature: boolean;
    immature: boolean;
    hypermature: boolean;
    trauma: boolean;
  };
  cataractLaterality: 'OD' | 'OS' | 'OU' | '';
  pterygium: boolean;
  pterygiumLaterality: 'OD' | 'OS' | 'OU' | '';
  refractionError: boolean;
  refractionLaterality: 'OD' | 'OS' | 'OU' | '';
  refractionNotes: string;
  other: boolean;
  otherDiagnosis: string;
  otherLaterality: 'OD' | 'OS' | 'OU' | '';
}

export interface BiometryData {
  odK1: string;
  odK2: string;
  odAl: string;
  odAcd: string;
  osK1: string;
  osK2: string;
  osAl: string;
  osAcd: string;
}

export interface IOLPowersData {
  OD_A1: string;
  OD_A2: string;
  OD_A3: string;
  OD_A4: string;
  OD_A5: string;
  OD_B1: string;
  OD_B2: string;
  OD_B3: string;
  OD_B4: string;
  OD_B5: string;
  OS_A1: string;
  OS_A2: string;
  OS_A3: string;
  OS_A4: string;
  OS_A5: string;
  OS_B1: string;
  OS_B2: string;
  OS_B3: string;
  OS_B4: string;
  OS_B5: string;
}

export interface SurgeryScheduleData {
  scheduledDate: string;
  scheduledTime: string;
  procedure: string;
  eyeOperated: 'OD' | 'OS' | 'OU' | '';
  iolPower: string;
  notes: string;
}

export interface TreatmentPlanData {
  forbiometry: boolean;
  forbiometryNotes: string;
  forva: boolean;
  forvaNotes: string;
  forsurgery: boolean;
  surgeryEye: 'OD' | 'OS' | 'OU' | '';
  forsurgeryNotes: string;
  postponesurgery: boolean;
  postponeDate: string;
  postponeNotes: string;
  requiresclearance: boolean;
  clearanceNotes: string;
  torefer: boolean;
  referDoctor: string;
  referNotes: string;
  graduated: boolean;
  graduatedNotes: string;
}
