# Restoration Instructions

The project was paused and restored to resolve API rate limits and authentication state inconsistencies.

## Steps to Finish Setup

1. **Wait for Project to be Active**:
   Ensure the Supabase project `mqzkbcyzahefgvodkmpz` is in `ACTIVE_HEALTHY` state.

2. **Clean Slate (Optional)**:
   If users partially exist, run this SQL in Supabase Dashboard (SQL Editor) or via MCP:
   ```sql
   DELETE FROM auth.users WHERE email IN ('luis@lprealestate.com', 'sarah@lprealestate.com', 'michael.chen@gmail.com', 'robert.t@gmail.com');
   ```

3. **create users**:
   Run the following command in the terminal:
   ```bash
   node signup-users.js
   ```
   This script has been updated to use `michael.chen@gmail.com` and includes a delay to avoid rate limits.

4. **Fix Roles**:
   Since the default role is `client`, you must promote the staff users.
   Run the SQL in `fix_roles.sql`:
   ```sql
   UPDATE public.profiles SET role = 'admin' FROM auth.users WHERE profiles.id = users.id AND users.email = 'luis@lprealestate.com';
   UPDATE public.profiles SET role = 'agent' FROM auth.users WHERE profiles.id = users.id AND users.email = 'sarah@lprealestate.com';
   UPDATE public.profiles SET role = 'loan_officer' FROM auth.users WHERE profiles.id = users.id AND users.email = 'michael.chen@gmail.com';
   ```

5. **Run Tests**:
   ```bash
   npm run test:e2e
   ```
