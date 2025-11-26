import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  email: string;
}

export interface AppState {
  version: string;
  remLogin: boolean;
  shrinkBar: boolean;
  loggedUsername: string;
  userNameWithTitle: string;
  userNameFull: string;
  userLastname: string;
  userFirstname: string;
  userTitle: string;
  userBranch: string;
  userSignature: string;
  userSignatureLink: string;
  infoTab: string;
  patientSort: string;
  loginBranch: string;
  clearanceTab: string;
  viewSetting: string;
  recoverSession: boolean;
  viewingBranch: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

export interface AppContextType extends AppState {
  setRemLogin: (value: boolean) => void;
  setShrinkBar: (value: boolean) => void;
  setLoggedUsername: (value: string) => void;
  setUserNameWithTitle: (value: string) => void;
  setUserNameFull: (value: string) => void;
  setUserLastname: (value: string) => void;
  setUserFirstname: (value: string) => void;
  setUserTitle: (value: string) => void;
  setUserBranch: (value: string) => void;
  setUserSignature: (value: string) => void;
  setUserSignatureLink: (value: string) => void;
  setInfoTab: (value: string) => void;
  setPatientSort: (value: string) => void;
  setLoginBranch: (value: string) => void;
  setClearanceTab: (value: string) => void;
  setViewSetting: (value: string) => void;
  setRecoverSession: (value: boolean) => void;
  setViewingBranch: (value: string) => void;
}

// Database types based on FlutterFlow schema
export interface Account {
  id: string;
  username: string;
  lastname: string;
  firstname: string;
  title: string;
  branch: string;
  signature_link?: string;
}

export interface Patient {
  id: string;
  patient_id: string;
  lastname: string;
  firstname: string;
  middlename?: string;
  birthdate?: string;
  gender?: string;
  contact_number?: string;
  address?: string;
  created_at: string;
  branch: string;
}

export interface Intake {
  id: string;
  patient_id: string;
  visit_date: string;
  chief_complaint?: string;
  history?: string;
  status: string;
  branch: string;
}

export interface Followup {
  id: string;
  patient_id: string;
  followup_date: string;
  notes?: string;
  status: string;
}

export interface Schedule {
  id: string;
  patient_id: string;
  scheduled_date: string;
  procedure_type?: string;
  status: string;
}
