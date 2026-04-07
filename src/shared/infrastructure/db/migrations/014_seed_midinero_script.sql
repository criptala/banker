-- Ensure Mi Dinero bank exists (may already be created by migration 013 backfill)
INSERT INTO banks (id, code, name, status)
VALUES ('a1000000-0000-0000-0000-000000000001', 'mi-dinero', 'Mi Dinero', 'ready')
ON CONFLICT (code) DO NOTHING;

-- Seed the active extract_transactions script for Mi Dinero (v1.0.0)
-- The actual code is loaded from disk by ScriptLoader:
--   src/contexts/script-engine/infrastructure/scripts/midinero/extract_transactions.v1.0.0.js
INSERT INTO bank_scripts (id, bank, flow_type, version, status, origin, selector_map, bank_id)
SELECT
  'b1000000-0000-0000-0000-000000000001',
  'mi-dinero',
  'extract_transactions',
  '1.0.0',
  'active',
  'system',
  '{}',
  b.id
FROM banks b
WHERE b.code = 'mi-dinero'
ON CONFLICT (id) DO NOTHING;
