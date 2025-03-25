/*
  # Create Franchises and Royalties Schema

  1. New Tables
    - `franchises`
      - `id` (uuid, primary key)
      - `name` (text)
      - `owner_name` (text)
      - `company_name` (text)
      - `tax_id` (text)
      - `email` (text)
      - `phone` (text)
      - `address` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `franchise_contracts`
      - `id` (uuid, primary key)
      - `franchise_id` (uuid, references franchises)
      - `start_date` (date)
      - `duration_years` (integer)
      - `royalty_amount` (numeric)
      - `marketing_amount` (numeric)
      - `annual_increase` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `royalty_payments`
      - `id` (uuid, primary key)
      - `franchise_id` (uuid, references franchises)
      - `due_date` (date)
      - `amount` (numeric)
      - `royalty_amount` (numeric)
      - `marketing_amount` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `invoices`
      - `id` (uuid, primary key)
      - `payment_id` (uuid, references royalty_payments)
      - `invoice_number` (text, unique)
      - `issue_date` (date)
      - `due_date` (date)
      - `total_amount` (numeric)
      - `tax_amount` (numeric)
      - `status` (text)
      - `sent_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create franchises table
CREATE TABLE IF NOT EXISTS franchises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_name text NOT NULL,
  company_name text NOT NULL,
  tax_id text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create franchise_contracts table
CREATE TABLE IF NOT EXISTS franchise_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id uuid REFERENCES franchises(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  duration_years integer NOT NULL,
  royalty_amount numeric NOT NULL,
  marketing_amount numeric NOT NULL,
  annual_increase numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create royalty_payments table
CREATE TABLE IF NOT EXISTS royalty_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id uuid REFERENCES franchises(id) ON DELETE CASCADE,
  due_date date NOT NULL,
  amount numeric NOT NULL,
  royalty_amount numeric NOT NULL,
  marketing_amount numeric NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'late')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES royalty_payments(id) ON DELETE CASCADE,
  invoice_number text UNIQUE NOT NULL,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  total_amount numeric NOT NULL,
  tax_amount numeric NOT NULL DEFAULT 1.00, -- 1 euro flat tax
  status text NOT NULL CHECK (status IN ('draft', 'sent', 'paid')),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read franchises"
  ON franchises
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert franchises"
  ON franchises
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update franchises"
  ON franchises
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read franchise_contracts"
  ON franchise_contracts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert franchise_contracts"
  ON franchise_contracts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update franchise_contracts"
  ON franchise_contracts
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read royalty_payments"
  ON royalty_payments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert royalty_payments"
  ON royalty_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update royalty_payments"
  ON royalty_payments
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_franchises_updated_at
  BEFORE UPDATE ON franchises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchise_contracts_updated_at
  BEFORE UPDATE ON franchise_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_royalty_payments_updated_at
  BEFORE UPDATE ON royalty_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();