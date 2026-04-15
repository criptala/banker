ALTER TABLE account_config
  ADD COLUMN IF NOT EXISTS notify_on_expired BOOLEAN NOT NULL DEFAULT false;
