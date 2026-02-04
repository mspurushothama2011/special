-- Add expense_type column to expenses table
-- Run this in Supabase SQL Editor:

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS expense_type text 
CHECK (expense_type IN ('personal', 'lent', 'borrowed', 'credit_card')) 
DEFAULT 'personal';

-- Update existing rows to have the default value
UPDATE expenses SET expense_type = 'personal' WHERE expense_type IS NULL;
