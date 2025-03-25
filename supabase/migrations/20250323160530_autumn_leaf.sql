/*
  # Add Invoice Fields

  1. Changes
    - Add `invoice_generated` boolean field to royalty_payments
    - Add `invoice_sent` boolean field to royalty_payments
    - Add `invoice_sent_at` timestamp field to royalty_payments

  2. Purpose
    - Track invoice generation and sending status directly on payments
    - Enable filtering and reporting on invoice status
*/

-- Add invoice tracking fields to royalty_payments
ALTER TABLE royalty_payments 
ADD COLUMN invoice_generated boolean DEFAULT false,
ADD COLUMN invoice_sent boolean DEFAULT false,
ADD COLUMN invoice_sent_at timestamptz;