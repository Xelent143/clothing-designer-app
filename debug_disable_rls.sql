-- DEBUG: Temporarily disable security to see if that's the blocker
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- If this fixes the issue, we know our Policies were wrong.
-- We can re-enable it later with: ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
