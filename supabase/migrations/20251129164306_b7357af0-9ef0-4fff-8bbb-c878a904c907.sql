-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view patients in their branch" ON public.patients;

-- Create new policy allowing all authenticated users to view all patients
CREATE POLICY "All staff can view all patients"
ON public.patients
FOR SELECT
TO authenticated
USING (true);

-- Update other policies to still maintain branch filtering for CREATE/UPDATE
-- (keeping data creation/modification branch-specific for data integrity)