-- Storage Setup for Social Media Direct Posting

-- 1. Create a new public bucket named 'public-assets'
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

-- 2. Allow Public Read Access (Required for Instagram API to fetch the image)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'public-assets' );

-- 3. Allow Authenticated Users to Upload (Insert)
create policy "Authenticated Users Upload"
on storage.objects for insert
with check (
  bucket_id = 'public-assets'
  and auth.role() = 'authenticated'
);

-- 4. Allow Users to Update/Delete their own files (Optional housekeeping)
create policy "Users Update Own"
on storage.objects for update
using (
  bucket_id = 'public-assets'
  and auth.uid() = owner
);
