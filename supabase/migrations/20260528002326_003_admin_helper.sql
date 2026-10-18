/*
  # Create Helper Function for Admin Access

  This creates a stored procedure that can be called to get admin session
*/

-- Create a function to generate a temporary admin session token
CREATE OR REPLACE FUNCTION get_admin_session()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'role', 'admin',
    'created_at', NOW()
  );
END;
$$;

-- Grant execute permission to anon
GRANT EXECUTE ON FUNCTION get_admin_session() TO anon;
GRANT EXECUTE ON FUNCTION get_admin_session() TO authenticated;