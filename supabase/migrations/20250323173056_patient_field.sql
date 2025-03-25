/*
  # Create team members table

  1. New Tables
    - `team_members`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text, unique)
      - `role` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `team_members` table
    - Add policies for authenticated users to manage team members
*/

CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Ensure role is one of the allowed values
ALTER TABLE team_members ADD CONSTRAINT team_members_role_check
  CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'consultant'::text]));

-- Ensure status is one of the allowed values
ALTER TABLE team_members ADD CONSTRAINT team_members_status_check
  CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text]));

-- Create policies
CREATE POLICY "Authenticated users can read team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert team members"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update team members"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();