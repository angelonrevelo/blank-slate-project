-- Add indexes for search optimization on patients table
CREATE INDEX IF NOT EXISTS idx_patients_firstname ON public.patients USING btree (firstname);
CREATE INDEX IF NOT EXISTS idx_patients_lastname ON public.patients USING btree (lastname);
CREATE INDEX IF NOT EXISTS idx_patients_contact_number ON public.patients USING btree (contact_number);

-- Add full-text search index for better search performance
CREATE INDEX IF NOT EXISTS idx_patients_fulltext_search ON public.patients 
  USING gin(to_tsvector('english', coalesce(firstname, '') || ' ' || coalesce(lastname, '') || ' ' || coalesce(patient_id, '')));

-- Add indexes for surgeries search
CREATE INDEX IF NOT EXISTS idx_surgeries_scheduled_date ON public.surgeries USING btree (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_surgeries_branch_date ON public.surgeries USING btree (branch, scheduled_date);

-- Add indexes for intakes search
CREATE INDEX IF NOT EXISTS idx_intakes_branch_date ON public.intakes USING btree (branch, created_at);
CREATE INDEX IF NOT EXISTS idx_intakes_stage ON public.intakes USING btree (stage);

-- Add indexes for followups
CREATE INDEX IF NOT EXISTS idx_followups_status_date ON public.followups USING btree (status, followup_date);
CREATE INDEX IF NOT EXISTS idx_followups_branch ON public.followups USING btree (branch);