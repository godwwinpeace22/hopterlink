-- Supabase Storage Buckets + Policies
-- Run this in Supabase SQL editor.

-- Buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('job-photos', 'job-photos', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('provider-documents', 'provider-documents', false, 10485760, array['image/jpeg','image/png','application/pdf']),
  ('provider-portfolios', 'provider-portfolios', true, 8388608, array['image/jpeg','image/png','image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp']),
  ('message-attachments', 'message-attachments', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do nothing;

-- job-photos policies
DROP POLICY IF EXISTS "Job photos are publicly accessible" ON storage.objects;
CREATE POLICY "Job photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'job-photos');

DROP POLICY IF EXISTS "Clients can upload job photos" ON storage.objects;
CREATE POLICY "Clients can upload job photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'job-photos' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
);

DROP POLICY IF EXISTS "Clients can delete own job photos" ON storage.objects;
CREATE POLICY "Clients can delete own job photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'job-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- provider-documents policies
DROP POLICY IF EXISTS "Providers can view own documents" ON storage.objects;
CREATE POLICY "Providers can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'provider-documents' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR
   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
);

DROP POLICY IF EXISTS "Providers can upload documents" ON storage.objects;
CREATE POLICY "Providers can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'provider-documents' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider')
);

DROP POLICY IF EXISTS "Providers can update own documents" ON storage.objects;
CREATE POLICY "Providers can update own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'provider-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- provider-portfolios policies
DROP POLICY IF EXISTS "Portfolio images are publicly accessible" ON storage.objects;
CREATE POLICY "Portfolio images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'provider-portfolios');

DROP POLICY IF EXISTS "Providers can upload portfolio images" ON storage.objects;
CREATE POLICY "Providers can upload portfolio images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'provider-portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider')
);

DROP POLICY IF EXISTS "Providers can delete own portfolio" ON storage.objects;
CREATE POLICY "Providers can delete own portfolio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'provider-portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- avatars policies
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- message-attachments policies
DROP POLICY IF EXISTS "Message attachments viewable by conversation participants" ON storage.objects;
CREATE POLICY "Message attachments viewable by conversation participants"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-attachments' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR
   auth.uid()::text = (storage.foldername(name))[2])
);

DROP POLICY IF EXISTS "Users can upload message attachments" ON storage.objects;
CREATE POLICY "Users can upload message attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
