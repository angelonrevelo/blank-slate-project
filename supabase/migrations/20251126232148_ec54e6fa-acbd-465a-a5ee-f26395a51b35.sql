-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'nurse', 'opd_staff', 'philhealth', 'manager');
CREATE TYPE public.patient_status AS ENUM ('Active', 'Inactive');
CREATE TYPE public.intake_status AS ENUM ('Pending', 'Completed', 'Cancelled');
CREATE TYPE public.followup_status AS ENUM ('Scheduled', 'Completed', 'Cancelled');
CREATE TYPE public.schedule_status AS ENUM ('Scheduled', 'Completed', 'Cancelled');
CREATE TYPE public.surgery_status AS ENUM ('Scheduled', 'In Progress', 'Completed', 'Cancelled');
CREATE TYPE public.clearance_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE public.gender_type AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE public.title_type AS ENUM ('OPD', 'Doctor', 'Nurse', 'Administrator', 'Director', 'PhilHealth', 'Manager');

-- User Roles Table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  lastname TEXT NOT NULL,
  firstname TEXT NOT NULL,
  title title_type NOT NULL,
  branch TEXT NOT NULL,
  signature_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Patients Table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT UNIQUE NOT NULL,
  lastname TEXT NOT NULL,
  firstname TEXT NOT NULL,
  middlename TEXT,
  birthdate DATE NOT NULL,
  gender gender_type NOT NULL,
  contact_number TEXT,
  address TEXT,
  branch TEXT NOT NULL,
  status patient_status DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Intakes Table
CREATE TABLE public.intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  chief_complaint TEXT,
  history TEXT,
  allergies TEXT,
  medications TEXT,
  status intake_status DEFAULT 'Pending',
  branch TEXT NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Followups Table
CREATE TABLE public.followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  intake_id UUID REFERENCES public.intakes(id) ON DELETE SET NULL,
  followup_date DATE NOT NULL,
  notes TEXT,
  status followup_status DEFAULT 'Scheduled',
  branch TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Schedules Table
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  procedure_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  notes TEXT,
  status schedule_status DEFAULT 'Scheduled',
  branch TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Surgeries Table
CREATE TABLE public.surgeries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  procedure TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  surgeon_id UUID REFERENCES public.profiles(id),
  status surgery_status DEFAULT 'Scheduled',
  branch TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Clearances Table
CREATE TABLE public.clearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  intake_id UUID REFERENCES public.intakes(id) ON DELETE SET NULL,
  clearance_type TEXT NOT NULL,
  status clearance_status DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Documents Table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Security Definer Function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user branch function
CREATE OR REPLACE FUNCTION public.get_user_branch(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT branch FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for patients (branch-based access)
CREATE POLICY "Users can view patients in their branch"
  ON public.patients FOR SELECT
  USING (branch = public.get_user_branch(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create patients in their branch"
  ON public.patients FOR INSERT
  WITH CHECK (branch = public.get_user_branch(auth.uid()));

CREATE POLICY "Users can update patients in their branch"
  ON public.patients FOR UPDATE
  USING (branch = public.get_user_branch(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for intakes
CREATE POLICY "Users can view intakes in their branch"
  ON public.intakes FOR SELECT
  USING (branch = public.get_user_branch(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create intakes in their branch"
  ON public.intakes FOR INSERT
  WITH CHECK (branch = public.get_user_branch(auth.uid()));

CREATE POLICY "Users can update intakes in their branch"
  ON public.intakes FOR UPDATE
  USING (branch = public.get_user_branch(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for followups
CREATE POLICY "Users can view followups in their branch"
  ON public.followups FOR SELECT
  USING (branch = public.get_user_branch(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create followups in their branch"
  ON public.followups FOR INSERT
  WITH CHECK (branch = public.get_user_branch(auth.uid()));

CREATE POLICY "Users can update followups in their branch"
  ON public.followups FOR UPDATE
  USING (branch = public.get_user_branch(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for schedules
CREATE POLICY "Users can view schedules in their branch"
  ON public.schedules FOR SELECT
  USING (branch = public.get_user_branch(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create schedules in their branch"
  ON public.schedules FOR INSERT
  WITH CHECK (branch = public.get_user_branch(auth.uid()));

CREATE POLICY "Users can update schedules in their branch"
  ON public.schedules FOR UPDATE
  USING (branch = public.get_user_branch(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for surgeries
CREATE POLICY "Users can view surgeries in their branch"
  ON public.surgeries FOR SELECT
  USING (branch = public.get_user_branch(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create surgeries in their branch"
  ON public.surgeries FOR INSERT
  WITH CHECK (branch = public.get_user_branch(auth.uid()));

CREATE POLICY "Users can update surgeries in their branch"
  ON public.surgeries FOR UPDATE
  USING (branch = public.get_user_branch(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for clearances
CREATE POLICY "Users can view clearances in their branch"
  ON public.clearances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE patients.id = clearances.patient_id 
      AND (patients.branch = public.get_user_branch(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can create clearances"
  ON public.clearances FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE patients.id = clearances.patient_id 
      AND patients.branch = public.get_user_branch(auth.uid())
    )
  );

-- RLS Policies for documents
CREATE POLICY "Users can view documents in their branch"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE patients.id = documents.patient_id 
      AND (patients.branch = public.get_user_branch(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can upload documents"
  ON public.documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE patients.id = documents.patient_id 
      AND patients.branch = public.get_user_branch(auth.uid())
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, lastname, firstname, title, branch)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'lastname', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'firstname', 'New'),
    COALESCE((NEW.raw_user_meta_data->>'title')::title_type, 'OPD'),
    COALESCE(NEW.raw_user_meta_data->>'branch', 'Main')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('patient-documents', 'patient-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for patient documents
CREATE POLICY "Users can view documents in their branch"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'patient-documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'patient-documents' AND
    auth.uid() IS NOT NULL
  );