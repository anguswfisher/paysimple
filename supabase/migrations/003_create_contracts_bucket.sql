-- Create contracts storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', true);

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to their own contracts folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'contracts' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own contract files
CREATE POLICY "Users can read own contract files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'contracts' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own contract files
CREATE POLICY "Users can update own contract files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'contracts' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own contract files
CREATE POLICY "Users can delete own contract files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'contracts' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
