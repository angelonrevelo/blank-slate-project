export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          branch: string
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          branch: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          branch?: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          code: string
          contact_number: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          operating_hours: Json | null
        }
        Insert: {
          address?: string | null
          code: string
          contact_number?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          operating_hours?: Json | null
        }
        Update: {
          address?: string | null
          code?: string
          contact_number?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          operating_hours?: Json | null
        }
        Relationships: []
      }
      clearances: {
        Row: {
          clearance_type: string
          created_at: string | null
          id: string
          intake_id: string | null
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["clearance_status"] | null
        }
        Insert: {
          clearance_type: string
          created_at?: string | null
          id?: string
          intake_id?: string | null
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["clearance_status"] | null
        }
        Update: {
          clearance_type?: string
          created_at?: string | null
          id?: string
          intake_id?: string | null
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["clearance_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "clearances_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clearances_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          name: string
          phone_number: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          name: string
          phone_number: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          phone_number?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      diagnoses: {
        Row: {
          branch: string
          cataract: boolean | null
          cataract_laterality:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          cataract_type: Database["public"]["Enums"]["cataract_type"] | null
          created_at: string | null
          created_by: string | null
          id: string
          intake_id: string | null
          other_diagnosis: string | null
          other_laterality: Database["public"]["Enums"]["eye_laterality"] | null
          patient_id: string
          pseudophakia: boolean | null
          pseudophakia_iol_details: string | null
          pseudophakia_laterality:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          pterygium: boolean | null
          pterygium_laterality:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          refraction_error: boolean | null
          refraction_laterality:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          refraction_notes: string | null
        }
        Insert: {
          branch: string
          cataract?: boolean | null
          cataract_laterality?:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          cataract_type?: Database["public"]["Enums"]["cataract_type"] | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          intake_id?: string | null
          other_diagnosis?: string | null
          other_laterality?:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          patient_id: string
          pseudophakia?: boolean | null
          pseudophakia_iol_details?: string | null
          pseudophakia_laterality?:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          pterygium?: boolean | null
          pterygium_laterality?:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          refraction_error?: boolean | null
          refraction_laterality?:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          refraction_notes?: string | null
        }
        Update: {
          branch?: string
          cataract?: boolean | null
          cataract_laterality?:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          cataract_type?: Database["public"]["Enums"]["cataract_type"] | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          intake_id?: string | null
          other_diagnosis?: string | null
          other_laterality?:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          patient_id?: string
          pseudophakia?: boolean | null
          pseudophakia_iol_details?: string | null
          pseudophakia_laterality?:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          pterygium?: boolean | null
          pterygium_laterality?:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          refraction_error?: boolean | null
          refraction_laterality?:
            | Database["public"]["Enums"]["eye_laterality"]
            | null
          refraction_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnoses_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnoses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          document_name: string
          document_type: string | null
          document_url: string
          id: string
          patient_id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          document_name: string
          document_type?: string | null
          document_url: string
          id?: string
          patient_id: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          document_name?: string
          document_type?: string | null
          document_url?: string
          id?: string
          patient_id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      eye_examinations: {
        Row: {
          anterior_segment_od_drawing: string | null
          anterior_segment_os_drawing: string | null
          biometry_od_acd: number | null
          biometry_od_al: number | null
          biometry_od_k1: number | null
          biometry_od_k2: number | null
          biometry_os_acd: number | null
          biometry_os_al: number | null
          biometry_os_k1: number | null
          biometry_os_k2: number | null
          branch: string
          created_at: string | null
          cup_disc_ratio_od: string | null
          cup_disc_ratio_os: string | null
          drawn_by: string | null
          examination_date: string | null
          fundus_od: string | null
          fundus_os: string | null
          id: string
          intake_id: string | null
          patient_id: string
          requested_by: string | null
          slit_lamp_od: string | null
          slit_lamp_os: string | null
          va_dist_od: string | null
          va_dist_od_axl: string | null
          va_dist_od_bc: string | null
          va_dist_od_k1: string | null
          va_dist_od_k2: string | null
          va_dist_od_ph: string | null
          va_dist_os: string | null
          va_dist_os_axl: string | null
          va_dist_os_bc: string | null
          va_dist_os_k1: string | null
          va_dist_os_k2: string | null
          va_dist_os_ph: string | null
          va_near_od: string | null
          va_near_od_ar: string | null
          va_near_od_axl: string | null
          va_near_od_bc: string | null
          va_near_od_k1: string | null
          va_near_od_k2: string | null
          va_near_od_ph: string | null
          va_near_os: string | null
          va_near_os_ar: string | null
          va_near_os_axl: string | null
          va_near_os_bc: string | null
          va_near_os_k1: string | null
          va_near_os_k2: string | null
          va_near_os_ph: string | null
          va_od: string | null
          va_od_corrected: string | null
          va_os: string | null
          va_os_corrected: string | null
        }
        Insert: {
          anterior_segment_od_drawing?: string | null
          anterior_segment_os_drawing?: string | null
          biometry_od_acd?: number | null
          biometry_od_al?: number | null
          biometry_od_k1?: number | null
          biometry_od_k2?: number | null
          biometry_os_acd?: number | null
          biometry_os_al?: number | null
          biometry_os_k1?: number | null
          biometry_os_k2?: number | null
          branch: string
          created_at?: string | null
          cup_disc_ratio_od?: string | null
          cup_disc_ratio_os?: string | null
          drawn_by?: string | null
          examination_date?: string | null
          fundus_od?: string | null
          fundus_os?: string | null
          id?: string
          intake_id?: string | null
          patient_id: string
          requested_by?: string | null
          slit_lamp_od?: string | null
          slit_lamp_os?: string | null
          va_dist_od?: string | null
          va_dist_od_axl?: string | null
          va_dist_od_bc?: string | null
          va_dist_od_k1?: string | null
          va_dist_od_k2?: string | null
          va_dist_od_ph?: string | null
          va_dist_os?: string | null
          va_dist_os_axl?: string | null
          va_dist_os_bc?: string | null
          va_dist_os_k1?: string | null
          va_dist_os_k2?: string | null
          va_dist_os_ph?: string | null
          va_near_od?: string | null
          va_near_od_ar?: string | null
          va_near_od_axl?: string | null
          va_near_od_bc?: string | null
          va_near_od_k1?: string | null
          va_near_od_k2?: string | null
          va_near_od_ph?: string | null
          va_near_os?: string | null
          va_near_os_ar?: string | null
          va_near_os_axl?: string | null
          va_near_os_bc?: string | null
          va_near_os_k1?: string | null
          va_near_os_k2?: string | null
          va_near_os_ph?: string | null
          va_od?: string | null
          va_od_corrected?: string | null
          va_os?: string | null
          va_os_corrected?: string | null
        }
        Update: {
          anterior_segment_od_drawing?: string | null
          anterior_segment_os_drawing?: string | null
          biometry_od_acd?: number | null
          biometry_od_al?: number | null
          biometry_od_k1?: number | null
          biometry_od_k2?: number | null
          biometry_os_acd?: number | null
          biometry_os_al?: number | null
          biometry_os_k1?: number | null
          biometry_os_k2?: number | null
          branch?: string
          created_at?: string | null
          cup_disc_ratio_od?: string | null
          cup_disc_ratio_os?: string | null
          drawn_by?: string | null
          examination_date?: string | null
          fundus_od?: string | null
          fundus_os?: string | null
          id?: string
          intake_id?: string | null
          patient_id?: string
          requested_by?: string | null
          slit_lamp_od?: string | null
          slit_lamp_os?: string | null
          va_dist_od?: string | null
          va_dist_od_axl?: string | null
          va_dist_od_bc?: string | null
          va_dist_od_k1?: string | null
          va_dist_od_k2?: string | null
          va_dist_od_ph?: string | null
          va_dist_os?: string | null
          va_dist_os_axl?: string | null
          va_dist_os_bc?: string | null
          va_dist_os_k1?: string | null
          va_dist_os_k2?: string | null
          va_dist_os_ph?: string | null
          va_near_od?: string | null
          va_near_od_ar?: string | null
          va_near_od_axl?: string | null
          va_near_od_bc?: string | null
          va_near_od_k1?: string | null
          va_near_od_k2?: string | null
          va_near_od_ph?: string | null
          va_near_os?: string | null
          va_near_os_ar?: string | null
          va_near_os_axl?: string | null
          va_near_os_bc?: string | null
          va_near_os_k1?: string | null
          va_near_os_k2?: string | null
          va_near_os_ph?: string | null
          va_od?: string | null
          va_od_corrected?: string | null
          va_os?: string | null
          va_os_corrected?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eye_examinations_drawn_by_fkey"
            columns: ["drawn_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eye_examinations_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eye_examinations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eye_examinations_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          acceptdate: string | null
          branch: string
          created_at: string | null
          followup_date: string
          forbiometry: boolean | null
          forbiometrynotes: string | null
          forsurgery: boolean | null
          forsurgerynotes: string | null
          forva: boolean | null
          forvanotes: string | null
          graduated: boolean | null
          graduatednotes: string | null
          id: string
          intake_id: string | null
          notes: string | null
          patient_id: string
          postponesurgery: boolean | null
          reminddate: string | null
          returndate: string | null
          status: Database["public"]["Enums"]["followup_status"] | null
          surgeryeye: Database["public"]["Enums"]["laterality_type"] | null
          torefer: boolean | null
          toreferdoctor: string | null
          torefernotes: string | null
          workflow_status:
            | Database["public"]["Enums"]["followup_workflow_type"]
            | null
        }
        Insert: {
          acceptdate?: string | null
          branch: string
          created_at?: string | null
          followup_date: string
          forbiometry?: boolean | null
          forbiometrynotes?: string | null
          forsurgery?: boolean | null
          forsurgerynotes?: string | null
          forva?: boolean | null
          forvanotes?: string | null
          graduated?: boolean | null
          graduatednotes?: string | null
          id?: string
          intake_id?: string | null
          notes?: string | null
          patient_id: string
          postponesurgery?: boolean | null
          reminddate?: string | null
          returndate?: string | null
          status?: Database["public"]["Enums"]["followup_status"] | null
          surgeryeye?: Database["public"]["Enums"]["laterality_type"] | null
          torefer?: boolean | null
          toreferdoctor?: string | null
          torefernotes?: string | null
          workflow_status?:
            | Database["public"]["Enums"]["followup_workflow_type"]
            | null
        }
        Update: {
          acceptdate?: string | null
          branch?: string
          created_at?: string | null
          followup_date?: string
          forbiometry?: boolean | null
          forbiometrynotes?: string | null
          forsurgery?: boolean | null
          forsurgerynotes?: string | null
          forva?: boolean | null
          forvanotes?: string | null
          graduated?: boolean | null
          graduatednotes?: string | null
          id?: string
          intake_id?: string | null
          notes?: string | null
          patient_id?: string
          postponesurgery?: boolean | null
          reminddate?: string | null
          returndate?: string | null
          status?: Database["public"]["Enums"]["followup_status"] | null
          surgeryeye?: Database["public"]["Enums"]["laterality_type"] | null
          torefer?: boolean | null
          toreferdoctor?: string | null
          torefernotes?: string | null
          workflow_status?:
            | Database["public"]["Enums"]["followup_workflow_type"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "followups_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      intakes: {
        Row: {
          allergies: string | null
          assigned_doctor: string | null
          assigned_nurse: string | null
          assigned_to: string | null
          branch: string
          chief_complaint: string | null
          chief_complaints: Json | null
          created_at: string | null
          ended_bio: string | null
          ended_file: string | null
          ended_opth: string | null
          ended_va: string | null
          endorser_opd: string | null
          history: string | null
          id: string
          in_progress: boolean | null
          medications: string | null
          ocular_history: Json | null
          past_medical_history: Json | null
          patient_id: string
          result_va: Json | null
          stage: Database["public"]["Enums"]["intake_stage"] | null
          started_bio: string | null
          started_file: string | null
          started_opth: string | null
          started_va: string | null
          status: Database["public"]["Enums"]["intake_status"] | null
          task_type: Database["public"]["Enums"]["intake_task_type"] | null
          visit_date: string | null
        }
        Insert: {
          allergies?: string | null
          assigned_doctor?: string | null
          assigned_nurse?: string | null
          assigned_to?: string | null
          branch: string
          chief_complaint?: string | null
          chief_complaints?: Json | null
          created_at?: string | null
          ended_bio?: string | null
          ended_file?: string | null
          ended_opth?: string | null
          ended_va?: string | null
          endorser_opd?: string | null
          history?: string | null
          id?: string
          in_progress?: boolean | null
          medications?: string | null
          ocular_history?: Json | null
          past_medical_history?: Json | null
          patient_id: string
          result_va?: Json | null
          stage?: Database["public"]["Enums"]["intake_stage"] | null
          started_bio?: string | null
          started_file?: string | null
          started_opth?: string | null
          started_va?: string | null
          status?: Database["public"]["Enums"]["intake_status"] | null
          task_type?: Database["public"]["Enums"]["intake_task_type"] | null
          visit_date?: string | null
        }
        Update: {
          allergies?: string | null
          assigned_doctor?: string | null
          assigned_nurse?: string | null
          assigned_to?: string | null
          branch?: string
          chief_complaint?: string | null
          chief_complaints?: Json | null
          created_at?: string | null
          ended_bio?: string | null
          ended_file?: string | null
          ended_opth?: string | null
          ended_va?: string | null
          endorser_opd?: string | null
          history?: string | null
          id?: string
          in_progress?: boolean | null
          medications?: string | null
          ocular_history?: Json | null
          past_medical_history?: Json | null
          patient_id?: string
          result_va?: Json | null
          stage?: Database["public"]["Enums"]["intake_stage"] | null
          started_bio?: string | null
          started_file?: string | null
          started_opth?: string | null
          started_va?: string | null
          status?: Database["public"]["Enums"]["intake_status"] | null
          task_type?: Database["public"]["Enums"]["intake_task_type"] | null
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intakes_assigned_doctor_fkey"
            columns: ["assigned_doctor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intakes_assigned_nurse_fkey"
            columns: ["assigned_nurse"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intakes_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intakes_endorser_opd_fkey"
            columns: ["endorser_opd"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intakes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          branch: string
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          branch: string
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          branch?: string
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      patientcount: {
        Row: {
          branch: string
          created_at: string | null
          date: string
          id: string
          new_patients: number | null
          returning_patients: number | null
          surgeries_completed: number | null
          surgeries_scheduled: number | null
          total_patients: number | null
        }
        Insert: {
          branch: string
          created_at?: string | null
          date: string
          id?: string
          new_patients?: number | null
          returning_patients?: number | null
          surgeries_completed?: number | null
          surgeries_scheduled?: number | null
          total_patients?: number | null
        }
        Update: {
          branch?: string
          created_at?: string | null
          date?: string
          id?: string
          new_patients?: number | null
          returning_patients?: number | null
          surgeries_completed?: number | null
          surgeries_scheduled?: number | null
          total_patients?: number | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          age: number | null
          biometry_od: Json | null
          biometry_os: Json | null
          birthdate: string
          branch: string
          civil_status: Database["public"]["Enums"]["civil_status_type"] | null
          clearance_approveddateod: string | null
          clearance_approveddateos: string | null
          clearance_fileod: string | null
          clearance_fileos: string | null
          clearance_requestdateod: string | null
          clearance_requestdateos: string | null
          contact_number: string | null
          created_at: string | null
          created_by: string | null
          firstname: string
          gender: Database["public"]["Enums"]["gender_type"]
          graduateddate: string | null
          graduatednotes: string | null
          id: string
          lastname: string
          middlename: string | null
          patient_id: string
          patient_photo_url: string | null
          philhealth_category:
            | Database["public"]["Enums"]["philhealth_category_type"]
            | null
          philhealth_member: boolean | null
          philhealth_no: string | null
          postponedate: string | null
          postponenotes: string | null
          previous_surgery_notes: string | null
          previous_surgery_od: boolean | null
          previous_surgery_od_date: string | null
          previous_surgery_os: boolean | null
          previous_surgery_os_date: string | null
          referred_by: string | null
          stage: Database["public"]["Enums"]["patient_stage"] | null
          status: Database["public"]["Enums"]["patient_status"] | null
          surgery_eye: Database["public"]["Enums"]["laterality_type"] | null
          surgerydate: string | null
          surgerydate_od: string | null
          surgerydate_os: string | null
          toreferdate: string | null
          torefernotes: string | null
          visit_count: number | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          biometry_od?: Json | null
          biometry_os?: Json | null
          birthdate: string
          branch: string
          civil_status?: Database["public"]["Enums"]["civil_status_type"] | null
          clearance_approveddateod?: string | null
          clearance_approveddateos?: string | null
          clearance_fileod?: string | null
          clearance_fileos?: string | null
          clearance_requestdateod?: string | null
          clearance_requestdateos?: string | null
          contact_number?: string | null
          created_at?: string | null
          created_by?: string | null
          firstname: string
          gender: Database["public"]["Enums"]["gender_type"]
          graduateddate?: string | null
          graduatednotes?: string | null
          id?: string
          lastname: string
          middlename?: string | null
          patient_id: string
          patient_photo_url?: string | null
          philhealth_category?:
            | Database["public"]["Enums"]["philhealth_category_type"]
            | null
          philhealth_member?: boolean | null
          philhealth_no?: string | null
          postponedate?: string | null
          postponenotes?: string | null
          previous_surgery_notes?: string | null
          previous_surgery_od?: boolean | null
          previous_surgery_od_date?: string | null
          previous_surgery_os?: boolean | null
          previous_surgery_os_date?: string | null
          referred_by?: string | null
          stage?: Database["public"]["Enums"]["patient_stage"] | null
          status?: Database["public"]["Enums"]["patient_status"] | null
          surgery_eye?: Database["public"]["Enums"]["laterality_type"] | null
          surgerydate?: string | null
          surgerydate_od?: string | null
          surgerydate_os?: string | null
          toreferdate?: string | null
          torefernotes?: string | null
          visit_count?: number | null
        }
        Update: {
          address?: string | null
          age?: number | null
          biometry_od?: Json | null
          biometry_os?: Json | null
          birthdate?: string
          branch?: string
          civil_status?: Database["public"]["Enums"]["civil_status_type"] | null
          clearance_approveddateod?: string | null
          clearance_approveddateos?: string | null
          clearance_fileod?: string | null
          clearance_fileos?: string | null
          clearance_requestdateod?: string | null
          clearance_requestdateos?: string | null
          contact_number?: string | null
          created_at?: string | null
          created_by?: string | null
          firstname?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          graduateddate?: string | null
          graduatednotes?: string | null
          id?: string
          lastname?: string
          middlename?: string | null
          patient_id?: string
          patient_photo_url?: string | null
          philhealth_category?:
            | Database["public"]["Enums"]["philhealth_category_type"]
            | null
          philhealth_member?: boolean | null
          philhealth_no?: string | null
          postponedate?: string | null
          postponenotes?: string | null
          previous_surgery_notes?: string | null
          previous_surgery_od?: boolean | null
          previous_surgery_od_date?: string | null
          previous_surgery_os?: boolean | null
          previous_surgery_os_date?: string | null
          referred_by?: string | null
          stage?: Database["public"]["Enums"]["patient_stage"] | null
          status?: Database["public"]["Enums"]["patient_status"] | null
          surgery_eye?: Database["public"]["Enums"]["laterality_type"] | null
          surgerydate?: string | null
          surgerydate_od?: string | null
          surgerydate_os?: string | null
          toreferdate?: string | null
          torefernotes?: string | null
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          branch: string
          created_at: string | null
          firstname: string
          id: string
          lastname: string
          signature_link: string | null
          title: Database["public"]["Enums"]["title_type"]
          updated_at: string | null
          user_preferences: Json | null
          username: string
        }
        Insert: {
          branch: string
          created_at?: string | null
          firstname: string
          id: string
          lastname: string
          signature_link?: string | null
          title: Database["public"]["Enums"]["title_type"]
          updated_at?: string | null
          user_preferences?: Json | null
          username: string
        }
        Update: {
          branch?: string
          created_at?: string | null
          firstname?: string
          id?: string
          lastname?: string
          signature_link?: string | null
          title?: Database["public"]["Enums"]["title_type"]
          updated_at?: string | null
          user_preferences?: Json | null
          username?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          branch: string
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          patient_id: string
          procedure_type: string
          scheduled_date: string
          scheduled_time: string
          status: Database["public"]["Enums"]["schedule_status"] | null
        }
        Insert: {
          branch: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          procedure_type: string
          scheduled_date: string
          scheduled_time: string
          status?: Database["public"]["Enums"]["schedule_status"] | null
        }
        Update: {
          branch?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          procedure_type?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: Database["public"]["Enums"]["schedule_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_logs: {
        Row: {
          created_at: string
          customer_id: string
          error_message: string | null
          id: string
          message_body: string
          provider_message_id: string | null
          provider_name: string
          request_payload: Json | null
          response_payload: Json | null
          schedule_id: string | null
          sent_at: string
          status: Database["public"]["Enums"]["sms_log_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          error_message?: string | null
          id?: string
          message_body: string
          provider_message_id?: string | null
          provider_name?: string
          request_payload?: Json | null
          response_payload?: Json | null
          schedule_id?: string | null
          sent_at?: string
          status: Database["public"]["Enums"]["sms_log_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          error_message?: string | null
          id?: string
          message_body?: string
          provider_message_id?: string | null
          provider_name?: string
          request_payload?: Json | null
          response_payload?: Json | null
          schedule_id?: string | null
          sent_at?: string
          status?: Database["public"]["Enums"]["sms_log_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_logs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "sms_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_schedules: {
        Row: {
          created_at: string
          current_retry: number
          customer_id: string
          id: string
          is_active: boolean
          last_error: string | null
          last_run_at: string | null
          max_retries: number
          message_body: string | null
          next_run_at: string
          recurrence_days_of_week: number[] | null
          recurrence_end_at: string | null
          recurrence_frequency:
            | Database["public"]["Enums"]["recurrence_frequency"]
            | null
          recurrence_interval: number | null
          schedule_type: Database["public"]["Enums"]["sms_schedule_type"]
          status: Database["public"]["Enums"]["sms_schedule_status"]
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_retry?: number
          customer_id: string
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_run_at?: string | null
          max_retries?: number
          message_body?: string | null
          next_run_at: string
          recurrence_days_of_week?: number[] | null
          recurrence_end_at?: string | null
          recurrence_frequency?:
            | Database["public"]["Enums"]["recurrence_frequency"]
            | null
          recurrence_interval?: number | null
          schedule_type?: Database["public"]["Enums"]["sms_schedule_type"]
          status?: Database["public"]["Enums"]["sms_schedule_status"]
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_retry?: number
          customer_id?: string
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_run_at?: string | null
          max_retries?: number
          message_body?: string | null
          next_run_at?: string
          recurrence_days_of_week?: number[] | null
          recurrence_end_at?: string | null
          recurrence_frequency?:
            | Database["public"]["Enums"]["recurrence_frequency"]
            | null
          recurrence_interval?: number | null
          schedule_type?: Database["public"]["Enums"]["sms_schedule_type"]
          status?: Database["public"]["Enums"]["sms_schedule_status"]
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_schedules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_schedules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "sms_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      surgeries: {
        Row: {
          active: boolean | null
          admitted_time: string | null
          branch: string
          cancelreason: string | null
          created_at: string | null
          ended_prep: string | null
          ended_prog: string | null
          ended_recovery: string | null
          ended_waiting: string | null
          eye_operated: Database["public"]["Enums"]["eye_laterality"] | null
          id: string
          iol_power: string | null
          patient_id: string
          procedure: string
          returndate: string | null
          scheduled_date: string
          scheduled_time: string
          scrub_nurse: string | null
          stage: Database["public"]["Enums"]["surgery_stage"] | null
          started_prep: string | null
          started_prog: string | null
          started_recovery: string | null
          started_waiting: string | null
          status: Database["public"]["Enums"]["surgery_status"] | null
          surgeon_id: string | null
        }
        Insert: {
          active?: boolean | null
          admitted_time?: string | null
          branch: string
          cancelreason?: string | null
          created_at?: string | null
          ended_prep?: string | null
          ended_prog?: string | null
          ended_recovery?: string | null
          ended_waiting?: string | null
          eye_operated?: Database["public"]["Enums"]["eye_laterality"] | null
          id?: string
          iol_power?: string | null
          patient_id: string
          procedure: string
          returndate?: string | null
          scheduled_date: string
          scheduled_time: string
          scrub_nurse?: string | null
          stage?: Database["public"]["Enums"]["surgery_stage"] | null
          started_prep?: string | null
          started_prog?: string | null
          started_recovery?: string | null
          started_waiting?: string | null
          status?: Database["public"]["Enums"]["surgery_status"] | null
          surgeon_id?: string | null
        }
        Update: {
          active?: boolean | null
          admitted_time?: string | null
          branch?: string
          cancelreason?: string | null
          created_at?: string | null
          ended_prep?: string | null
          ended_prog?: string | null
          ended_recovery?: string | null
          ended_waiting?: string | null
          eye_operated?: Database["public"]["Enums"]["eye_laterality"] | null
          id?: string
          iol_power?: string | null
          patient_id?: string
          procedure?: string
          returndate?: string | null
          scheduled_date?: string
          scheduled_time?: string
          scrub_nurse?: string | null
          stage?: Database["public"]["Enums"]["surgery_stage"] | null
          started_prep?: string | null
          started_prog?: string | null
          started_recovery?: string | null
          started_waiting?: string | null
          status?: Database["public"]["Enums"]["surgery_status"] | null
          surgeon_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surgeries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_scrub_nurse_fkey"
            columns: ["scrub_nurse"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_surgeon_id_fkey"
            columns: ["surgeon_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workload: {
        Row: {
          branch: string
          created_at: string | null
          date: string
          doctor_id: string
          id: string
          patient_count: number | null
        }
        Insert: {
          branch: string
          created_at?: string | null
          date: string
          doctor_id: string
          id?: string
          patient_count?: number | null
        }
        Update: {
          branch?: string
          created_at?: string | null
          date?: string
          doctor_id?: string
          id?: string
          patient_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workload_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_age: { Args: { birthdate: string }; Returns: number }
      get_next_patient_id: { Args: { p_branch: string }; Returns: string }
      get_user_branch: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "doctor"
        | "nurse"
        | "opd_staff"
        | "philhealth"
        | "manager"
      cataract_type: "Mature" | "Immature" | "Hypermature" | "Trauma"
      civil_status_type:
        | "Single"
        | "Married"
        | "Widowed"
        | "Divorced"
        | "Separated"
      clearance_status: "Pending" | "Approved" | "Rejected"
      eye_laterality: "OD" | "OS" | "OU"
      followup_status: "Scheduled" | "Completed" | "Cancelled"
      followup_workflow_type:
        | "clearance"
        | "medical_management"
        | "surgery_board"
        | "post_op_evaluation"
        | "doctor_referral"
      gender_type: "Male" | "Female" | "Other"
      intake_stage: "file" | "va" | "opth" | "bio" | "completed"
      intake_status: "Pending" | "Completed" | "Cancelled"
      intake_task_type:
        | "patient_record_creation"
        | "visual_acuity"
        | "ophthalmology_eval"
        | "surgery_scheduling"
        | "biometry_test"
      laterality_type: "OD" | "OS" | "OU"
      notification_type:
        | "task_assigned"
        | "surgery_scheduled"
        | "clearance_pending"
        | "followup_due"
        | "patient_assigned"
        | "system"
      patient_stage:
        | "new"
        | "file"
        | "va"
        | "opth"
        | "bio"
        | "for_surgery"
        | "postponed"
        | "clearance"
        | "to_refer"
        | "graduated"
        | "none"
      patient_status: "Active" | "Inactive"
      philhealth_category_type: "Member" | "Dependent" | "Indigent" | "Senior"
      recurrence_frequency: "daily" | "weekly" | "monthly"
      schedule_status: "Scheduled" | "Completed" | "Cancelled"
      sms_log_status: "success" | "failed"
      sms_schedule_status:
        | "pending"
        | "scheduled"
        | "sending"
        | "sent"
        | "failed"
        | "cancelled"
      sms_schedule_type: "one_time" | "recurring"
      surgery_stage:
        | "scheduled"
        | "waiting"
        | "prep"
        | "in_progress"
        | "recovery"
        | "completed"
        | "cancelled"
      surgery_status: "Scheduled" | "In Progress" | "Completed" | "Cancelled"
      title_type:
        | "OPD"
        | "Doctor"
        | "Nurse"
        | "Administrator"
        | "Director"
        | "PhilHealth"
        | "Manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "doctor",
        "nurse",
        "opd_staff",
        "philhealth",
        "manager",
      ],
      cataract_type: ["Mature", "Immature", "Hypermature", "Trauma"],
      civil_status_type: [
        "Single",
        "Married",
        "Widowed",
        "Divorced",
        "Separated",
      ],
      clearance_status: ["Pending", "Approved", "Rejected"],
      eye_laterality: ["OD", "OS", "OU"],
      followup_status: ["Scheduled", "Completed", "Cancelled"],
      followup_workflow_type: [
        "clearance",
        "medical_management",
        "surgery_board",
        "post_op_evaluation",
        "doctor_referral",
      ],
      gender_type: ["Male", "Female", "Other"],
      intake_stage: ["file", "va", "opth", "bio", "completed"],
      intake_status: ["Pending", "Completed", "Cancelled"],
      intake_task_type: [
        "patient_record_creation",
        "visual_acuity",
        "ophthalmology_eval",
        "surgery_scheduling",
        "biometry_test",
      ],
      laterality_type: ["OD", "OS", "OU"],
      notification_type: [
        "task_assigned",
        "surgery_scheduled",
        "clearance_pending",
        "followup_due",
        "patient_assigned",
        "system",
      ],
      patient_stage: [
        "new",
        "file",
        "va",
        "opth",
        "bio",
        "for_surgery",
        "postponed",
        "clearance",
        "to_refer",
        "graduated",
        "none",
      ],
      patient_status: ["Active", "Inactive"],
      philhealth_category_type: ["Member", "Dependent", "Indigent", "Senior"],
      recurrence_frequency: ["daily", "weekly", "monthly"],
      schedule_status: ["Scheduled", "Completed", "Cancelled"],
      sms_log_status: ["success", "failed"],
      sms_schedule_status: [
        "pending",
        "scheduled",
        "sending",
        "sent",
        "failed",
        "cancelled",
      ],
      sms_schedule_type: ["one_time", "recurring"],
      surgery_stage: [
        "scheduled",
        "waiting",
        "prep",
        "in_progress",
        "recovery",
        "completed",
        "cancelled",
      ],
      surgery_status: ["Scheduled", "In Progress", "Completed", "Cancelled"],
      title_type: [
        "OPD",
        "Doctor",
        "Nurse",
        "Administrator",
        "Director",
        "PhilHealth",
        "Manager",
      ],
    },
  },
} as const
