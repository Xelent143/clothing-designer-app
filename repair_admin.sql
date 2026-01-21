-- Run this in Supabase SQL Editor to manually force the Admin role

-- 1. Insert or Update the profile for the specific email
INSERT INTO public.profiles (id, email, role, is_active, credits, full_name)
SELECT 
  id, 
  email, 
  'admin', 
  true, 
  9999, 
  COALESCE(raw_user_meta_data->>'full_name', 'Super Admin')
FROM auth.users
WHERE email = 'xelenttraders@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', is_active = true, credits = 9999;

-- 2. Verify the result (Optional, results will show in dashboard)
SELECT * FROM profiles WHERE email = 'xelenttraders@gmail.com';
