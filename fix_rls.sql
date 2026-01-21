-- RLS Fix Script
-- 1. Create a secure function to check if the current user is an admin
-- This function runs with "security definer" privileges, meaning it bypasses RLS to check the role.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all profiles." ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles." ON profiles;
DROP POLICY IF EXISTS "Users can view own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- 3. Re-create Policies using the new function
-- Allow users to view their own profile is basic
CREATE POLICY "Users can view own profile." ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow admins to view ALL profiles
CREATE POLICY "Admins can view all profiles." ON profiles
  FOR SELECT USING (public.is_admin());

-- Allow admins to update ALL profiles
CREATE POLICY "Admins can update all profiles." ON profiles
  FOR UPDATE USING (public.is_admin());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. Verify/Grant usage (just in case)
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon;
