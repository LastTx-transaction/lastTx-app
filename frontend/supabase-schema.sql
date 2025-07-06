-- Create wills table in Supabase
CREATE TABLE wills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  smart_contract_id TEXT NOT NULL UNIQUE,
  date_of_execution TIMESTAMP WITH TIME ZONE NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  message TEXT,
  percentage_of_money INTEGER NOT NULL CHECK (percentage_of_money > 0 AND percentage_of_money <= 100),
  owner_address TEXT NOT NULL,
  owner_email TEXT,
  owner_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'executed', 'cancelled', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX idx_wills_owner_address ON wills(owner_address);
CREATE INDEX idx_wills_smart_contract_id ON wills(smart_contract_id);
CREATE INDEX idx_wills_status ON wills(status);
CREATE INDEX idx_wills_date_of_execution ON wills(date_of_execution);
