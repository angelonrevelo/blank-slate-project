-- Drop old incorrect policies that don't match actual file structure
DROP POLICY IF EXISTS "Users can view their own signatures" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own signatures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own signatures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own signatures" ON storage.objects;

-- Make patient-documents bucket public so signatures can be accessed via getPublicUrl()
UPDATE storage.buckets SET public = true WHERE id = 'patient-documents';

-- New policies that match actual path structure: signatures/{user_id}-{timestamp}.png
-- For signatures: allow users to manage files with their user_id in the filename
CREATE POLICY "Users can insert their own signatures"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'patient-documents'
  AND name LIKE 'signatures/' || auth.uid()::text || '%'
);

CREATE POLICY "Users can update their own signatures"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'patient-documents'
  AND name LIKE 'signatures/' || auth.uid()::text || '%'
);

CREATE POLICY "Users can delete their own signatures"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'patient-documents'
  AND name LIKE 'signatures/' || auth.uid()::text || '%'
);

-- Allow all authenticated users to view signatures (public bucket)
CREATE POLICY "Authenticated users can view signatures"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'patient-documents'
  AND name LIKE 'signatures/%'
  AND auth.role() = 'authenticated'
);