-- FINAL SECURITY FIX
-- 1. Re-enable Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop all previous complex policies
DROP POLICY IF EXISTS "Admins can view all profiles." ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles." ON profiles;
DROP POLICY IF EXISTS "Users can view own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- 3. Create Simple, Non-Recursive Policies

-- Policy A: Everyone can see/edit their own profile
CREATE POLICY "Self Access" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Policy B: Super Admin can see/edit EVERYTHING (bypassing table lookup recursion by using JWT)
CREATE POLICY "Super Admin Access" ON profiles
  FOR ALL USING (auth.jwt() ->> 'email' = 'xelenttraders@gmail.com');
