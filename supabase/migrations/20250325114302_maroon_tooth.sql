/*
  # Update Schema for User Authentication

  1. Changes
    - Add user_id column to relevant tables
    - Update RLS policies to use auth.uid()
    - Add team_member_roles table
    - Add user role mapping

  2. Security
    - Update RLS policies to enforce user-based access
    - Add role-based access control
*/

-- Add user_id to team_members
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create team_member_roles table
CREATE TABLE IF NOT EXISTS team_member_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default roles
INSERT INTO team_member_roles (name, description) VALUES
('admin', 'Full system access'),
('manager', 'Manage franchises and support'),
('consultant', 'Handle support and training')
ON CONFLICT (name) DO NOTHING;

-- Update RLS policies for team_members
DROP POLICY IF EXISTS "Authenticated users can read team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can insert team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can update team members" ON team_members;

CREATE POLICY "Users can read team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

CREATE POLICY "Admins can update team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

-- Update RLS policies for help_desk_tickets
DROP POLICY IF EXISTS "Authenticated users can read help desk tickets" ON help_desk_tickets;
DROP POLICY IF EXISTS "Authenticated users can insert help desk tickets" ON help_desk_tickets;
DROP POLICY IF EXISTS "Authenticated users can update help desk tickets" ON help_desk_tickets;

CREATE POLICY "Users can read assigned tickets"
  ON help_desk_tickets FOR SELECT
  TO authenticated
  USING (
    assigned_to IN (
      SELECT id FROM team_members WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can create tickets"
  ON help_desk_tickets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update assigned tickets"
  ON help_desk_tickets FOR UPDATE
  TO authenticated
  USING (
    assigned_to IN (
      SELECT id FROM team_members WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'manager')
    )
  );

-- Update RLS policies for ticket_comments
DROP POLICY IF EXISTS "Authenticated users can read ticket comments" ON ticket_comments;
DROP POLICY IF EXISTS "Authenticated users can insert ticket comments" ON ticket_comments;
DROP POLICY IF EXISTS "Authenticated users can update their own comments" ON ticket_comments;

CREATE POLICY "Users can read ticket comments"
  ON ticket_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM help_desk_tickets ht
      WHERE ht.id = ticket_id
      AND (
        ht.assigned_to IN (SELECT id FROM team_members WHERE user_id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.user_id = auth.uid()
          AND tm.role IN ('admin', 'manager')
        )
      )
    )
  );

CREATE POLICY "Users can create ticket comments"
  ON ticket_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM help_desk_tickets ht
      WHERE ht.id = ticket_id
      AND (
        ht.assigned_to IN (SELECT id FROM team_members WHERE user_id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.user_id = auth.uid()
          AND tm.role IN ('admin', 'manager')
        )
      )
    )
  );

CREATE POLICY "Users can update their own comments"
  ON ticket_comments FOR UPDATE
  TO authenticated
  USING (
    author_id IN (SELECT id FROM team_members WHERE user_id = auth.uid())
  );

-- Update RLS policies for ticket_attachments
DROP POLICY IF EXISTS "Authenticated users can read ticket attachments" ON ticket_attachments;
DROP POLICY IF EXISTS "Authenticated users can insert ticket attachments" ON ticket_attachments;

CREATE POLICY "Users can read ticket attachments"
  ON ticket_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM help_desk_tickets ht
      WHERE ht.id = ticket_id
      AND (
        ht.assigned_to IN (SELECT id FROM team_members WHERE user_id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.user_id = auth.uid()
          AND tm.role IN ('admin', 'manager')
        )
      )
    )
  );

CREATE POLICY "Users can create ticket attachments"
  ON ticket_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM help_desk_tickets ht
      WHERE ht.id = ticket_id
      AND (
        ht.assigned_to IN (SELECT id FROM team_members WHERE user_id = auth.uid())
        OR EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.user_id = auth.uid()
          AND tm.role IN ('admin', 'manager')
        )
      )
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_help_desk_tickets_assigned_to ON help_desk_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_author_id ON ticket_comments(author_id);