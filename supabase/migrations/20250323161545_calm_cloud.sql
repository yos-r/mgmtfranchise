/*
  # Add indexes and additional fields

  1. New Indexes
    - Add indexes for frequently queried columns in all tables
    - Add composite indexes for common query patterns
    
  2. Additional Fields
    - Add payment tracking fields to royalty_payments
    - Add payment method and reference fields
    - Add notes field for additional information
    
  3. Changes
    - Add constraints to ensure valid date ranges
    - Add validation for numeric fields
*/

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_franchises_name ON franchises (name);
CREATE INDEX IF NOT EXISTS idx_franchises_company_name ON franchises (company_name);
CREATE INDEX IF NOT EXISTS idx_royalty_payments_status ON royalty_payments (status);
CREATE INDEX IF NOT EXISTS idx_royalty_payments_due_date ON royalty_payments (due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices (issue_date);

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_royalty_payments_franchise_date 
ON royalty_payments (franchise_id, due_date);

CREATE INDEX IF NOT EXISTS idx_invoices_payment_status 
ON invoices (payment_id, status);

-- Add payment tracking fields
ALTER TABLE royalty_payments
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS payment_date date,
ADD COLUMN IF NOT EXISTS notes text,
ADD CONSTRAINT payment_method_check 
CHECK (payment_method IN ('transfer', 'check', 'cash', 'versement'));

-- Add constraints for date validation
ALTER TABLE franchise_contracts
ADD CONSTRAINT valid_contract_duration 
CHECK (duration_years > 0);

ALTER TABLE royalty_payments
ADD CONSTRAINT valid_payment_date 
CHECK (payment_date IS NULL OR payment_date <= CURRENT_DATE);

ALTER TABLE invoices
ADD CONSTRAINT valid_invoice_dates 
CHECK (issue_date <= due_date);

-- Add constraints for numeric values
ALTER TABLE franchise_contracts
ADD CONSTRAINT positive_amounts 
CHECK (
  royalty_amount >= 0 AND 
  marketing_amount >= 0 AND 
  annual_increase >= 0
);

ALTER TABLE royalty_payments
ADD CONSTRAINT positive_payment_amounts 
CHECK (
  amount >= 0 AND 
  royalty_amount >= 0 AND 
  marketing_amount >= 0
);

-- Create indexes on foreign keys for better join performance
CREATE INDEX IF NOT EXISTS idx_franchise_contracts_franchise_id 
ON franchise_contracts (franchise_id);

CREATE INDEX IF NOT EXISTS idx_royalty_payments_franchise_id 
ON royalty_payments (franchise_id);

CREATE INDEX IF NOT EXISTS idx_invoices_payment_id 
ON invoices (payment_id);