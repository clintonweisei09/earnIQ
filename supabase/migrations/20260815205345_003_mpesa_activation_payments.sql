/*
# M-Pesa Activation Payments

## Purpose
Introduces real M-Pesa STK push payments for account activation. Users pay an
activation fee via M-Pesa to unlock the task marketplace.

## Changes

### profiles
- Adds `is_activated` (boolean, default false) column used by the frontend to
  gate access to the task marketplace.

### mpesa_payments (NEW)
- `id` — uuid primary key
- `user_id` — uuid, owner of the payment, defaults to auth.uid()
- `phone` — text, M-Pesa phone number submitted for STK push
- `amount` — numeric, amount charged in KES
- `account_reference` — text, reference shown on the STK prompt
- `transaction_desc` — text, description of the payment
- `checkout_request_id` — text, M-Pesa STK push identifier
- `merchant_request_id` — text, M-Pesa merchant identifier
- `mpesa_receipt_no` — text, receipt number returned on success
- `status` — text, one of: pending, success, failed, cancelled
- `result_code` — integer, M-Pesa result code from callback
- `result_desc` — text, M-Pesa result description from callback
- `created_at` / `updated_at` — timestamps

## Security
- RLS enabled on mpesa_payments.
- Owner-scoped SELECT/INSERT/UPDATE for authenticated users (they can create
  and view their own payment records; status updates happen via the service
  role in the callback edge function, not via the client).
- No DELETE policy — payment records are immutable from the client.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_activated boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS mpesa_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  phone text NOT NULL,
  amount numeric(10,2) NOT NULL,
  account_reference text,
  transaction_desc text,
  checkout_request_id text,
  merchant_request_id text,
  mpesa_receipt_no text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed','cancelled')),
  result_code integer,
  result_desc text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mpesa_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mpesa_payments_select_own" ON mpesa_payments;
CREATE POLICY "mpesa_payments_select_own" ON mpesa_payments
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "mpesa_payments_insert_own" ON mpesa_payments;
CREATE POLICY "mpesa_payments_insert_own" ON mpesa_payments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "mpesa_payments_update_own" ON mpesa_payments;
CREATE POLICY "mpesa_payments_update_own" ON mpesa_payments
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_mpesa_payments_user ON mpesa_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_payments_checkout ON mpesa_payments(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_payments_status ON mpesa_payments(status);

DROP TRIGGER IF EXISTS update_mpesa_payments_updated_at ON mpesa_payments;
CREATE TRIGGER update_mpesa_payments_updated_at
  BEFORE UPDATE ON mpesa_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
