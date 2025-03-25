/*
  # Training and Support Schema

  1. New Tables
    - `training_events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `type` (text) - meeting, training, workshop
      - `date` (date)
      - `time` (text)
      - `duration` (text)
      - `description` (text)
      - `status` (text) - scheduled, completed, cancelled
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `training_materials`
      - `id` (uuid, primary key) 
      - `event_id` (uuid, foreign key)
      - `name` (text)
      - `type` (text)
      - `url` (text)
      - `size` (text)
      - `uploaded_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `training_attendance`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `franchise_id` (uuid, foreign key)
      - `attended` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `support_visits`
      - `id` (uuid, primary key)
      - `franchise_id` (uuid, foreign key)
      - `consultant_id` (uuid, foreign key)
      - `type` (text) - quarterly review, technical support, performance review
      - `date` (date)
      - `duration` (text)
      - `status` (text) - scheduled, completed, cancelled
      - `observations` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `support_action_plans`
      - `id` (uuid, primary key)
      - `visit_id` (uuid, foreign key)
      - `action` (text)
      - `deadline` (date)
      - `status` (text) - pending, completed
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Training Events
CREATE TABLE IF NOT EXISTS training_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  duration text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE training_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE training_events ADD CONSTRAINT training_events_type_check
  CHECK (type = ANY (ARRAY['meeting'::text, 'training'::text, 'workshop'::text]));

ALTER TABLE training_events ADD CONSTRAINT training_events_status_check
  CHECK (status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'cancelled'::text]));

-- Training Materials
CREATE TABLE IF NOT EXISTS training_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES training_events(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  size text,
  uploaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;

-- Training Attendance
CREATE TABLE IF NOT EXISTS training_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES training_events(id) ON DELETE CASCADE,
  franchise_id uuid REFERENCES franchises(id) ON DELETE CASCADE,
  attended boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, franchise_id)
);

ALTER TABLE training_attendance ENABLE ROW LEVEL SECURITY;

-- Support Visits
CREATE TABLE IF NOT EXISTS support_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id uuid REFERENCES franchises(id) ON DELETE CASCADE,
  consultant_id uuid REFERENCES team_members(id) ON DELETE SET NULL,
  type text NOT NULL,
  date date NOT NULL,
  duration text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  observations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_visits ENABLE ROW LEVEL SECURITY;

ALTER TABLE support_visits ADD CONSTRAINT support_visits_type_check
  CHECK (type = ANY (ARRAY['quarterly_review'::text, 'technical_support'::text, 'performance_review'::text]));

ALTER TABLE support_visits ADD CONSTRAINT support_visits_status_check
  CHECK (status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'cancelled'::text]));

-- Support Action Plans
CREATE TABLE IF NOT EXISTS support_action_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid REFERENCES support_visits(id) ON DELETE CASCADE,
  action text NOT NULL,
  deadline date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_action_plans ENABLE ROW LEVEL SECURITY;

ALTER TABLE support_action_plans ADD CONSTRAINT support_action_plans_status_check
  CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text]));

-- RLS Policies for Training Events
CREATE POLICY "Authenticated users can read training events"
  ON training_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert training events"
  ON training_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update training events"
  ON training_events
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for Training Materials
CREATE POLICY "Authenticated users can read training materials"
  ON training_materials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert training materials"
  ON training_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update training materials"
  ON training_materials
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for Training Attendance
CREATE POLICY "Authenticated users can read training attendance"
  ON training_attendance
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert training attendance"
  ON training_attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update training attendance"
  ON training_attendance
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for Support Visits
CREATE POLICY "Authenticated users can read support visits"
  ON support_visits
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert support visits"
  ON support_visits
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update support visits"
  ON support_visits
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for Support Action Plans
CREATE POLICY "Authenticated users can read support action plans"
  ON support_action_plans
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert support action plans"
  ON support_action_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update support action plans"
  ON support_action_plans
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_training_events_updated_at
  BEFORE UPDATE ON training_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_materials_updated_at
  BEFORE UPDATE ON training_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_attendance_updated_at
  BEFORE UPDATE ON training_attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_visits_updated_at
  BEFORE UPDATE ON support_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_action_plans_updated_at
  BEFORE UPDATE ON support_action_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();