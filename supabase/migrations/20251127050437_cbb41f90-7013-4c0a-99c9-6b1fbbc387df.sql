-- Phase 1: Database Schema Updates for VBE Eye Center

-- Create new enum types
CREATE TYPE public.civil_status_type AS ENUM ('Single', 'Married', 'Widowed', 'Divorced', 'Separated');
CREATE TYPE public.philhealth_category_type AS ENUM ('Member', 'Dependent', 'Indigent', 'Senior');
CREATE TYPE public.intake_task_type AS ENUM ('patient_record_creation', 'visual_acuity', 'ophthalmology_eval', 'surgery_scheduling', 'biometry_test');
CREATE TYPE public.followup_workflow_type AS ENUM ('clearance', 'medical_management', 'surgery_board', 'post_op_evaluation', 'doctor_referral');
CREATE TYPE public.eye_laterality AS ENUM ('OD', 'OS', 'OU');
CREATE TYPE public.cataract_type AS ENUM ('Mature', 'Immature', 'Hypermature', 'Trauma');

-- Update patients table with new fields
ALTER TABLE public.patients 
  ADD COLUMN civil_status civil_status_type,
  ADD COLUMN referred_by text,
  ADD COLUMN philhealth_member boolean DEFAULT false,
  ADD COLUMN philhealth_no text,
  ADD COLUMN philhealth_category philhealth_category_type,
  ADD COLUMN previous_surgery_od boolean DEFAULT false,
  ADD COLUMN previous_surgery_od_date date,
  ADD COLUMN previous_surgery_os boolean DEFAULT false,
  ADD COLUMN previous_surgery_os_date date,
  ADD COLUMN previous_surgery_notes text,
  ADD COLUMN patient_photo_url text;

-- Update intakes table with workflow fields
ALTER TABLE public.intakes
  ADD COLUMN task_type intake_task_type DEFAULT 'patient_record_creation',
  ADD COLUMN chief_complaints jsonb DEFAULT '{}',
  ADD COLUMN ocular_history jsonb DEFAULT '{}',
  ADD COLUMN past_medical_history jsonb DEFAULT '{}';

-- Update followups table with workflow status
ALTER TABLE public.followups
  ADD COLUMN workflow_status followup_workflow_type DEFAULT 'clearance';

-- Update surgeries table with eye-specific fields
ALTER TABLE public.surgeries
  ADD COLUMN eye_operated eye_laterality,
  ADD COLUMN iol_power text;

-- Create branches table
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  address text,
  contact_number text,
  email text,
  operating_hours jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Branches policies
CREATE POLICY "All authenticated users can view branches"
  ON public.branches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage branches"
  ON public.branches FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create diagnoses table
CREATE TABLE public.diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  intake_id uuid REFERENCES public.intakes(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id),
  branch text NOT NULL,
  
  -- Pseudophakia
  pseudophakia boolean DEFAULT false,
  pseudophakia_laterality eye_laterality,
  pseudophakia_iol_details text,
  
  -- Cataract
  cataract boolean DEFAULT false,
  cataract_type cataract_type,
  cataract_laterality eye_laterality,
  
  -- Pterygium
  pterygium boolean DEFAULT false,
  pterygium_laterality eye_laterality,
  
  -- Error of Refraction
  refraction_error boolean DEFAULT false,
  refraction_laterality eye_laterality,
  refraction_notes text,
  
  -- Other
  other_diagnosis text,
  other_laterality eye_laterality
);

-- Enable RLS on diagnoses
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

-- Diagnoses policies
CREATE POLICY "Users can view diagnoses in their branch"
  ON public.diagnoses FOR SELECT
  TO authenticated
  USING (
    branch = public.get_user_branch(auth.uid()) 
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create diagnoses in their branch"
  ON public.diagnoses FOR INSERT
  TO authenticated
  WITH CHECK (branch = public.get_user_branch(auth.uid()));

CREATE POLICY "Users can update diagnoses in their branch"
  ON public.diagnoses FOR UPDATE
  TO authenticated
  USING (
    branch = public.get_user_branch(auth.uid()) 
    OR public.has_role(auth.uid(), 'admin')
  );

-- Create eye_examinations table
CREATE TABLE public.eye_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  intake_id uuid REFERENCES public.intakes(id) ON DELETE SET NULL,
  examination_date timestamp with time zone DEFAULT now(),
  branch text NOT NULL,
  
  -- Visual Acuity
  va_od text,
  va_os text,
  va_od_corrected text,
  va_os_corrected text,
  
  -- Biometry OD (Right Eye)
  biometry_od_k1 numeric,
  biometry_od_k2 numeric,
  biometry_od_al numeric,
  biometry_od_acd numeric,
  
  -- Biometry OS (Left Eye)
  biometry_os_k1 numeric,
  biometry_os_k2 numeric,
  biometry_os_al numeric,
  biometry_os_acd numeric,
  
  -- Anterior Segment Drawings (base64 or storage URLs)
  anterior_segment_od_drawing text,
  anterior_segment_os_drawing text,
  
  -- Attribution
  requested_by uuid REFERENCES public.profiles(id),
  drawn_by uuid REFERENCES public.profiles(id),
  
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on eye_examinations
ALTER TABLE public.eye_examinations ENABLE ROW LEVEL SECURITY;

-- Eye examinations policies
CREATE POLICY "Users can view examinations in their branch"
  ON public.eye_examinations FOR SELECT
  TO authenticated
  USING (
    branch = public.get_user_branch(auth.uid()) 
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create examinations in their branch"
  ON public.eye_examinations FOR INSERT
  TO authenticated
  WITH CHECK (branch = public.get_user_branch(auth.uid()));

CREATE POLICY "Users can update examinations in their branch"
  ON public.eye_examinations FOR UPDATE
  TO authenticated
  USING (
    branch = public.get_user_branch(auth.uid()) 
    OR public.has_role(auth.uid(), 'admin')
  );

-- Seed branches table with VBE Eye Center locations
INSERT INTO public.branches (name, code, address, contact_number, email, operating_hours) VALUES
  (
    'VBE Eye Center - Quezon City',
    'QC',
    'Quezon City, Metro Manila',
    '+63-XXX-XXXX',
    'qc@vbeeyecenter.com',
    '{"monday": "8:00 AM - 5:00 PM", "tuesday": "8:00 AM - 5:00 PM", "wednesday": "8:00 AM - 5:00 PM", "thursday": "8:00 AM - 5:00 PM", "friday": "8:00 AM - 5:00 PM", "saturday": "8:00 AM - 12:00 PM", "sunday": "Closed"}'
  ),
  (
    'VBE Eye Center - Tanauan City',
    'TC',
    'Tanauan City, Batangas',
    '+63-XXX-XXXX',
    'tanauan@vbeeyecenter.com',
    '{"monday": "8:00 AM - 5:00 PM", "tuesday": "8:00 AM - 5:00 PM", "wednesday": "8:00 AM - 5:00 PM", "thursday": "8:00 AM - 5:00 PM", "friday": "8:00 AM - 5:00 PM", "saturday": "8:00 AM - 12:00 PM", "sunday": "Closed"}'
  );