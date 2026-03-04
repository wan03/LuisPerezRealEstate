-- Add UPDATE policy for profiles table

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can update own profile" ON profiles 
    FOR UPDATE USING (auth.uid() = id);
