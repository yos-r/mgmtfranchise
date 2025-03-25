/*
  # Help Desk Schema Update

  1. Tables
    - `help_desk_tickets`
    - `ticket_comments`
    - `ticket_attachments`

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  Note: This migration includes existence checks to prevent duplicate constraint errors
*/

-- Help Desk Tickets
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS help_desk_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    franchise_id uuid REFERENCES franchises(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    status text NOT NULL DEFAULT 'open',
    priority text NOT NULL DEFAULT 'medium',
    category text NOT NULL,
    assigned_to uuid REFERENCES team_members(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    resolved_at timestamptz
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE help_desk_tickets ENABLE ROW LEVEL SECURITY;

-- Add constraints if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'help_desk_tickets_status_check'
  ) THEN
    ALTER TABLE help_desk_tickets ADD CONSTRAINT help_desk_tickets_status_check
      CHECK (status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'help_desk_tickets_priority_check'
  ) THEN
    ALTER TABLE help_desk_tickets ADD CONSTRAINT help_desk_tickets_priority_check
      CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'help_desk_tickets_category_check'
  ) THEN
    ALTER TABLE help_desk_tickets ADD CONSTRAINT help_desk_tickets_category_check
      CHECK (category = ANY (ARRAY['technical'::text, 'billing'::text, 'general'::text, 'training'::text, 'other'::text]));
  END IF;
END $$;

-- Ticket Comments
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS ticket_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid REFERENCES help_desk_tickets(id) ON DELETE CASCADE,
    author_id uuid REFERENCES team_members(id) ON DELETE SET NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Ticket Attachments
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS ticket_attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid REFERENCES help_desk_tickets(id) ON DELETE CASCADE,
    name text NOT NULL,
    url text NOT NULL,
    size text,
    type text NOT NULL,
    uploaded_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  -- Help Desk Tickets Policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read help desk tickets'
  ) THEN
    CREATE POLICY "Authenticated users can read help desk tickets"
      ON help_desk_tickets
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert help desk tickets'
  ) THEN
    CREATE POLICY "Authenticated users can insert help desk tickets"
      ON help_desk_tickets
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update help desk tickets'
  ) THEN
    CREATE POLICY "Authenticated users can update help desk tickets"
      ON help_desk_tickets
      FOR UPDATE
      TO authenticated
      USING (true);
  END IF;

  -- Ticket Comments Policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read ticket comments'
  ) THEN
    CREATE POLICY "Authenticated users can read ticket comments"
      ON ticket_comments
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert ticket comments'
  ) THEN
    CREATE POLICY "Authenticated users can insert ticket comments"
      ON ticket_comments
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update their own comments'
  ) THEN
    CREATE POLICY "Authenticated users can update their own comments"
      ON ticket_comments
      FOR UPDATE
      TO authenticated
      USING (author_id = auth.uid());
  END IF;

  -- Ticket Attachments Policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read ticket attachments'
  ) THEN
    CREATE POLICY "Authenticated users can read ticket attachments"
      ON ticket_attachments
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert ticket attachments'
  ) THEN
    CREATE POLICY "Authenticated users can insert ticket attachments"
      ON ticket_attachments
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Create updated_at triggers if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_help_desk_tickets_updated_at'
  ) THEN
    CREATE TRIGGER update_help_desk_tickets_updated_at
      BEFORE UPDATE ON help_desk_tickets
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_ticket_comments_updated_at'
  ) THEN
    CREATE TRIGGER update_ticket_comments_updated_at
      BEFORE UPDATE ON ticket_comments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;