-- Backfill existing NULLs before adding NOT NULL constraint
UPDATE accounts SET name = bank WHERE name IS NULL;

ALTER TABLE accounts ALTER COLUMN name SET NOT NULL;
