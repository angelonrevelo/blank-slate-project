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
          created_at: string | null
          history: string | null
          id: string
          medications: string | null
          patient_id: string
          status: Database["public"]["Enums"]["intake_status"] | null
          visit_date: string | null
        }
        Insert: {
          allergies?: string | null
          assigned_to?: string | null
          branch: string
          chief_complaint?: string | null
          created_at?: string | null
          history?: string | null
          id?: string
          medications?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["intake_status"] | null
          visit_date?: string | null
        }
        Update: {
          allergies?: string | null
          assigned_to?: string | null
          branch?: string
          chief_complaint?: string | null
          created_at?: string | null
          history?: string | null
          id?: string
          medications?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["intake_status"] | null
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
          contact_number: string | null
          created_at: string | null
          created_by: string | null
          firstname: string
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          lastname: string
          middlename: string | null
          patient_id: string
          status: Database["public"]["Enums"]["patient_status"] | null
        }
        Insert: {
          address?: string | null
          birthdate: string
          branch: string
          contact_number?: string | null
          created_at?: string | null
          created_by?: string | null
          firstname: string
          gender: Database["public"]["Enums"]["gender_type"]
          id?: string
          lastname: string
          middlename?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["patient_status"] | null
        }
        Update: {
          address?: string | null
          birthdate?: string
          branch?: string
          contact_number?: string | null
          created_at?: string | null
          created_by?: string | null
          firstname?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: string
          lastname?: string
          middlename?: string | null
          patient_id?: string
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
          id: string
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
          id?: string
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
          id?: string
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
      clearance_status: "Pending" | "Approved" | "Rejected"
      followup_status: "Scheduled" | "Completed" | "Cancelled"
      gender_type: "Male" | "Female" | "Other"
      intake_status: "Pending" | "Completed" | "Cancelled"
      patient_status: "Active" | "Inactive"
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
      clearance_status: ["Pending", "Approved", "Rejected"],
      followup_status: ["Scheduled", "Completed", "Cancelled"],
      gender_type: ["Male", "Female", "Other"],
      intake_status: ["Pending", "Completed", "Cancelled"],
      patient_status: ["Active", "Inactive"],
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
