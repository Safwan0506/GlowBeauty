/*
  # Fix Client Login Access

  This migration allows public read access to clients for login verification.
  The application uses simple username/password matching, not Supabase Auth.
*/

-- Drop restrictive policies
DROP POLICY IF EXISTS "Clients can read own data" ON clients;
DROP POLICY IF EXISTS "Clients can update own data" ON clients;

-- Allow anyone to read clients (needed for login verification)
CREATE POLICY "Anyone can read clients for login"
  ON clients FOR SELECT
  TO public
  USING (true);

-- Allow anyone to update clients (for profile updates after login)
CREATE POLICY "Anyone can update clients"
  ON clients FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);