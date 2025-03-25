/*
  # Help Desk Schema

  1. New Tables
    - `help_desk_tickets`
      - `id` (uuid, primary key)
      - `franchise_id` (uuid, references franchises)
      - `title` (text)
      - `description` (text)
      - `status` (text)
      - `priority` (text)
      - `category` (text)
      - `assigned_to` (uuid, references team_members)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `resolved_at` (timestamptz)
    
    - `ticket_comments`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references help_desk_tickets)
      - `author_id` (uuid, references team_members)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `ticket_attachments`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references help_desk_tickets)
      - `name` (text)
      - `url` (text)
      - `size` (text)
      - `type` (text)
      - `uploaded_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Help Desk Tickets
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

ALTER TABLE help_desk_tickets ENABLE ROW LEVEL SECURITY;

-- Status check constraint
ALTER TABLE help_desk_tickets ADD CONSTRAINT help_desk_tickets_status_check
  CHECK (status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text]));

-- Priority check constraint
ALTER TABLE help_desk_tickets ADD CONSTRAINT help_desk_tickets_priority_check
  CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]));

-- Category check constraint
ALTER TABLE help_desk_tickets ADD CONSTRAINT help_desk_tickets_category_check
  CHECK (category = ANY (ARRAY['technical'::text, 'billing'::text, 'general'::text, 'training'::text, 'other'::text]));

-- Ticket Comments
CREATE TABLE IF NOT EXISTS ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES help_desk_tickets(id) ON DELETE CASCADE,
  author_id uuid REFERENCES team_members(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Ticket Attachments
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES help_desk_tickets(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  size text,
  type text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Help Desk Tickets
CREATE POLICY "Authenticated users can read help desk tickets"
  ON help_desk_tickets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert help desk tickets"
  ON help_desk_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update help desk tickets"
  ON help_desk_tickets
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for Ticket Comments
CREATE POLICY "Authenticated users can read ticket comments"
  ON ticket_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ticket comments"
  ON ticket_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update their own comments"
  ON ticket_comments
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

-- RLS Policies for Ticket Attachments
CREATE POLICY "Authenticated users can read ticket attachments"
  ON ticket_attachments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ticket attachments"
  ON ticket_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_help_desk_tickets_updated_at
  BEFORE UPDATE ON help_desk_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at
  BEFORE UPDATE ON ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();