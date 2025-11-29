-- Enable users to read their own signatures
CREATE POLICY "Users can view their own signatures"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'patient-documents' 
  AND (storage.foldername(name))[1] = 'signatures'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Enable users to upload their own signatures  
CREATE POLICY "Users can upload their own signatures"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'patient-documents'
  AND (storage.foldername(name))[1] = 'signatures'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Enable users to update their own signatures
CREATE POLICY "Users can update their own signatures"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'patient-documents'
  AND (storage.foldername(name))[1] = 'signatures'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Enable users to delete their own signatures
CREATE POLICY "Users can delete their own signatures"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'patient-documents'
  AND (storage.foldername(name))[1] = 'signatures'
  AND auth.uid()::text = (storage.foldername(name))[2]
);