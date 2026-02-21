-- Drop the Foreign Key constraint that forces profiles.id to match auth.users.id
-- This allows us to create "Lead" profiles for clients who haven't signed up yet.

ALTER TABLE profiles
DROP CONSTRAINT profiles_id_fkey;

-- We should probably update the column documentation or naming if possible, but schema changes are enough.
-- Now 'id' is just a UUID, not necessarily a User ID.
