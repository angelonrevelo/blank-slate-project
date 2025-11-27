-- Phase 1: Database Schema Enhancement
-- Add missing fields to match old FlutterFlow app schema

-- Create laterality enum for eye side tracking
CREATE TYPE laterality_type AS ENUM ('OD', 'OS', 'OU');

-- Create enums for new stage fields
CREATE TYPE intake_stage AS ENUM ('file', 'va', 'opth', 'bio', 'completed');
CREATE TYPE patient_stage AS ENUM ('new', 'file', 'va', 'opth', 'bio', 'for_surgery', 'postponed', 'clearance', 'to_refer', 'graduated', 'none');
CREATE TYPE surgery_stage AS ENUM ('scheduled', 'waiting', 'prep', 'in_progress', 'recovery', 'completed', 'cancelled');

-- Update intakes table
ALTER TABLE intakes
ADD COLUMN endorser_opd uuid REFERENCES profiles(id),
ADD COLUMN assigned_nurse uuid REFERENCES profiles(id),
ADD COLUMN assigned_doctor uuid REFERENCES profiles(id),
ADD COLUMN started_file timestamp with time zone,
ADD COLUMN ended_file timestamp with time zone,
ADD COLUMN started_va timestamp with time zone,
ADD COLUMN ended_va timestamp with time zone,
ADD COLUMN started_opth timestamp with time zone,
ADD COLUMN ended_opth timestamp with time zone,
ADD COLUMN started_bio timestamp with time zone,
ADD COLUMN ended_bio timestamp with time zone,
ADD COLUMN stage intake_stage DEFAULT 'file',
ADD COLUMN in_progress boolean DEFAULT false,
ADD COLUMN result_va jsonb DEFAULT '{}'::jsonb;

-- Update patients table
ALTER TABLE patients
ADD COLUMN age integer,
ADD COLUMN stage patient_stage DEFAULT 'new',
ADD COLUMN visit_count integer DEFAULT 0,
ADD COLUMN surgery_eye laterality_type,
ADD COLUMN surgerydate date,
ADD COLUMN surgerydate_od date,
ADD COLUMN surgerydate_os date,
ADD COLUMN clearance_fileod text,
ADD COLUMN clearance_fileos text,
ADD COLUMN clearance_requestdateod date,
ADD COLUMN clearance_requestdateos date,
ADD COLUMN clearance_approveddateod date,
ADD COLUMN clearance_approveddateos date,
ADD COLUMN postponedate date,
ADD COLUMN postponenotes text,
ADD COLUMN toreferdate date,
ADD COLUMN torefernotes text,
ADD COLUMN graduateddate date,
ADD COLUMN graduatednotes text,
ADD COLUMN biometry_od jsonb DEFAULT '{}'::jsonb,
ADD COLUMN biometry_os jsonb DEFAULT '{}'::jsonb;

-- Update followups table
ALTER TABLE followups
ADD COLUMN forsurgery boolean DEFAULT false,
ADD COLUMN forsurgerynotes text,
ADD COLUMN surgeryeye laterality_type,
ADD COLUMN postponesurgery boolean DEFAULT false,
ADD COLUMN torefer boolean DEFAULT false,
ADD COLUMN toreferdoctor text,
ADD COLUMN torefernotes text,
ADD COLUMN forbiometry boolean DEFAULT false,
ADD COLUMN forbiometrynotes text,
ADD COLUMN forva boolean DEFAULT false,
ADD COLUMN forvanotes text,
ADD COLUMN graduated boolean DEFAULT false,
ADD COLUMN graduatednotes text,
ADD COLUMN acceptdate date,
ADD COLUMN reminddate date,
ADD COLUMN returndate date;

-- Update surgeries table
ALTER TABLE surgeries
ADD COLUMN admitted_time timestamp with time zone,
ADD COLUMN started_waiting timestamp with time zone,
ADD COLUMN ended_waiting timestamp with time zone,
ADD COLUMN started_prep timestamp with time zone,
ADD COLUMN ended_prep timestamp with time zone,
ADD COLUMN started_prog timestamp with time zone,
ADD COLUMN ended_prog timestamp with time zone,
ADD COLUMN started_recovery timestamp with time zone,
ADD COLUMN ended_recovery timestamp with time zone,
ADD COLUMN scrub_nurse uuid REFERENCES profiles(id),
ADD COLUMN cancelreason text,
ADD COLUMN returndate date,
ADD COLUMN active boolean DEFAULT true,
ADD COLUMN stage surgery_stage DEFAULT 'scheduled';

-- Create workload table for doctor workload tracking
CREATE TABLE workload (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES profiles(id) NOT NULL,
  date date NOT NULL,
  patient_count integer DEFAULT 0,
  branch text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(doctor_id, date, branch)
);

-- Enable RLS on workload
ALTER TABLE workload ENABLE ROW LEVEL SECURITY;

-- Workload policies
CREATE POLICY "Users can view workload in their branch"
ON workload FOR SELECT
USING (branch = get_user_branch(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert workload in their branch"
ON workload FOR INSERT
WITH CHECK (branch = get_user_branch(auth.uid()));

CREATE POLICY "Users can update workload in their branch"
ON workload FOR UPDATE
USING (branch = get_user_branch(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Create patientcount table for daily statistics
CREATE TABLE patientcount (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  new_patients integer DEFAULT 0,
  returning_patients integer DEFAULT 0,
  total_patients integer DEFAULT 0,
  surgeries_scheduled integer DEFAULT 0,
  surgeries_completed integer DEFAULT 0,
  branch text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(date, branch)
);

-- Enable RLS on patientcount
ALTER TABLE patientcount ENABLE ROW LEVEL SECURITY;

-- Patientcount policies
CREATE POLICY "Users can view patientcount in their branch"
ON patientcount FOR SELECT
USING (branch = get_user_branch(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert patientcount in their branch"
ON patientcount FOR INSERT
WITH CHECK (branch = get_user_branch(auth.uid()));

CREATE POLICY "Users can update patientcount in their branch"
ON patientcount FOR UPDATE
USING (branch = get_user_branch(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Create RPC function to generate next patient ID
CREATE OR REPLACE FUNCTION get_next_patient_id(p_branch text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number integer;
  branch_code text;
  year_code text;
BEGIN
  -- Get branch code (QC or TC)
  SELECT code INTO branch_code FROM branches WHERE name = p_branch LIMIT 1;
  
  -- Get year code (last 2 digits)
  year_code := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Get max patient number for this branch and year
  SELECT COALESCE(MAX(CAST(SUBSTRING(patient_id FROM '[0-9]+$') AS integer)), 0) + 1
  INTO next_number
  FROM patients
  WHERE patient_id LIKE branch_code || year_code || '%'
    AND branch = p_branch;
  
  -- Return formatted patient ID (e.g., QC25-00001)
  RETURN branch_code || year_code || '-' || LPAD(next_number::text, 5, '0');
END;
$$;

-- Create function to calculate age from birthdate
CREATE OR REPLACE FUNCTION calculate_age(birthdate date)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate))::integer;
$$;

-- Create trigger to auto-update age field
CREATE OR REPLACE FUNCTION update_patient_age()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.age := calculate_age(NEW.birthdate);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_patient_age
BEFORE INSERT OR UPDATE OF birthdate ON patients
FOR EACH ROW
EXECUTE FUNCTION update_patient_age();