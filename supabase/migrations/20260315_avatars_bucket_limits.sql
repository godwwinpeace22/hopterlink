-- Enforce a 5 MB file size limit and restrict MIME types on the avatars bucket.
-- This is the server-side enforcement to complement client-side validation.

UPDATE storage.buckets
SET
  file_size_limit    = 5242880,  -- 5 MB in bytes
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'avatars';
    