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
          drawn_by: string | null
          examination_date: string | null
          id: string
          intake_id: string | null
          patient_id: string
          requested_by: string | null
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
          drawn_by?: string | null
          examination_date?: string | null
          id?: string
          intake_id?: string | null
          patient_id: string
          requested_by?: string | null
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
          drawn_by?: string | null
          examination_date?: string | null
          id?: string
          intake_id?: string | null
          patient_id?: string
          requested_by?: string | null
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
          branch: string
          created_at: string | null
          followup_date: string
          id: string
          intake_id: string | null
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["followup_status"] | null
          workflow_status:
            | Database["public"]["Enums"]["followup_workflow_type"]
            | null
        }
        Insert: {
          branch: string
          created_at?: string | null
          followup_date: string
          id?: string
          intake_id?: string | null
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["followup_status"] | null
          workflow_status?:
            | Database["public"]["Enums"]["followup_workflow_type"]
            | null
        }
        Update: {
          branch?: string
          created_at?: string | null
          followup_date?: string
          id?: string
          intake_id?: string | null
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["followup_status"] | null
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
          assigned_to: string | null
          branch: string
          chief_complaint: string | null
          chief_complaints: Json | null
          created_at: string | null
          history: string | null
          id: string
          medications: string | null
          ocular_history: Json | null
          past_medical_history: Json | null
          patient_id: string
          status: Database["public"]["Enums"]["intake_status"] | null
          task_type: Database["public"]["Enums"]["intake_task_type"] | null
          visit_date: string | null
        }
        Insert: {
          allergies?: string | null
          assigned_to?: string | null
          branch: string
          chief_complaint?: string | null
          chief_complaints?: Json | null
          created_at?: string | null
          history?: string | null
          id?: string
          medications?: string | null
          ocular_history?: Json | null
          past_medical_history?: Json | null
          patient_id: string
          status?: Database["public"]["Enums"]["intake_status"] | null
          task_type?: Database["public"]["Enums"]["intake_task_type"] | null
          visit_date?: string | null
        }
        Update: {
          allergies?: string | null
          assigned_to?: string | null
          branch?: string
          chief_complaint?: string | null
          chief_complaints?: Json | null
          created_at?: string | null
          history?: string | null
          id?: string
          medications?: string | null
          ocular_history?: Json | null
          past_medical_history?: Json | null
          patient_id?: string
          status?: Database["public"]["Enums"]["intake_status"] | null
          task_type?: Database["public"]["Enums"]["intake_task_type"] | null
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intakes_assigned_to_fkey"
            columns: ["assigned_to"]
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
      patients: {
        Row: {
          address: string | null
          birthdate: string
          branch: string
          civil_status: Database["public"]["Enums"]["civil_status_type"] | null
          contact_number: string | null
          created_at: string | null
          created_by: string | null
          firstname: string
          gender: Database["public"]["Enums"]["gender_type"]
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
          previous_surgery_notes: string | null
          previous_surgery_od: boolean | null
          previous_surgery_od_date: string | null
          previous_surgery_os: boolean | null
          previous_surgery_os_date: string | null
          referred_by: string | null
          status: Database["public"]["Enums"]["patient_status"] | null
        }
        Insert: {
          address?: string | null
          birthdate: string
          branch: string
          civil_status?: Database["public"]["Enums"]["civil_status_type"] | null
          contact_number?: string | null
          created_at?: string | null
          created_by?: string | null
          firstname: string
          gender: Database["public"]["Enums"]["gender_type"]
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
          previous_surgery_notes?: string | null
          previous_surgery_od?: boolean | null
          previous_surgery_od_date?: string | null
          previous_surgery_os?: boolean | null
          previous_surgery_os_date?: string | null
          referred_by?: string | null
          status?: Database["public"]["Enums"]["patient_status"] | null
        }
        Update: {
          address?: string | null
          birthdate?: string
          branch?: string
          civil_status?: Database["public"]["Enums"]["civil_status_type"] | null
          contact_number?: string | null
          created_at?: string | null
          created_by?: string | null
          firstname?: string
          gender?: Database["public"]["Enums"]["gender_type"]
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
          previous_surgery_notes?: string | null
          previous_surgery_od?: boolean | null
          previous_surgery_od_date?: string | null
          previous_surgery_os?: boolean | null
          previous_surgery_os_date?: string | null
          referred_by?: string | null
          status?: Database["public"]["Enums"]["patient_status"] | null
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
      surgeries: {
        Row: {
          branch: string
          created_at: string | null
          eye_operated: Database["public"]["Enums"]["eye_laterality"] | null
          id: string
          iol_power: string | null
          patient_id: string
          procedure: string
          scheduled_date: string
          scheduled_time: string
          status: Database["public"]["Enums"]["surgery_status"] | null
          surgeon_id: string | null
        }
        Insert: {
          branch: string
          created_at?: string | null
          eye_operated?: Database["public"]["Enums"]["eye_laterality"] | null
          id?: string
          iol_power?: string | null
          patient_id: string
          procedure: string
          scheduled_date: string
          scheduled_time: string
          status?: Database["public"]["Enums"]["surgery_status"] | null
          surgeon_id?: string | null
        }
        Update: {
          branch?: string
          created_at?: string | null
          eye_operated?: Database["public"]["Enums"]["eye_laterality"] | null
          id?: string
          iol_power?: string | null
          patient_id?: string
          procedure?: string
          scheduled_date?: string
          scheduled_time?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      intake_status: "Pending" | "Completed" | "Cancelled"
      intake_task_type:
        | "patient_record_creation"
        | "visual_acuity"
        | "ophthalmology_eval"
        | "surgery_scheduling"
        | "biometry_test"
      patient_status: "Active" | "Inactive"
      philhealth_category_type: "Member" | "Dependent" | "Indigent" | "Senior"
      schedule_status: "Scheduled" | "Completed" | "Cancelled"
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
      intake_status: ["Pending", "Completed", "Cancelled"],
      intake_task_type: [
        "patient_record_creation",
        "visual_acuity",
        "ophthalmology_eval",
        "surgery_scheduling",
        "biometry_test",
      ],
      patient_status: ["Active", "Inactive"],
      philhealth_category_type: ["Member", "Dependent", "Indigent", "Senior"],
      schedule_status: ["Scheduled", "Completed", "Cancelled"],
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
