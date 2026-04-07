import { db } from '../../../shared/infrastructure/db/client.js'
import { BankScript, FlowType } from '../domain/BankScript.js'
import { IBankScriptRepository } from '../domain/IBankScriptRepository.js'

export class BankScriptRepository implements IBankScriptRepository {
  async findActive(bank: string, flowType: FlowType): Promise<BankScript | null> {
    const { rows } = await db.query(
      `SELECT * FROM bank_scripts WHERE bank=$1 AND flow_type=$2 AND status='active' LIMIT 1`,
      [bank, flowType]
    )
    if (!rows[0]) return null
    return BankScript.reconstitute(rows[0].id, {
      bank: rows[0].bank,
      flowType: rows[0].flow_type,
      version: rows[0].version,
      status: rows[0].status,
      origin: rows[0].origin,
      baseScriptId: rows[0].base_script_id ?? undefined,
      codeSnapshot: rows[0].code_snapshot ?? undefined,
      selectorMap: rows[0].selector_map,
      createdAt: rows[0].created_at,
    })
  }

  async findById(id: string): Promise<BankScript | null> {
    const { rows } = await db.query(
      `SELECT * FROM bank_scripts WHERE id=$1`,
      [id]
    )
    if (!rows[0]) return null
    return BankScript.reconstitute(rows[0].id, {
      bank: rows[0].bank,
      flowType: rows[0].flow_type,
      version: rows[0].version,
      status: rows[0].status,
      origin: rows[0].origin,
      baseScriptId: rows[0].base_script_id ?? undefined,
      codeSnapshot: rows[0].code_snapshot ?? undefined,
      selectorMap: rows[0].selector_map,
      createdAt: rows[0].created_at,
    })
  }

  async save(script: BankScript): Promise<void> {
    await db.query(
      `INSERT INTO bank_scripts
         (id, bank, flow_type, version, status, origin, base_script_id, code_snapshot, selector_map, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         code_snapshot = EXCLUDED.code_snapshot`,
      [
        script.id,
        script.bank,
        script.flowType,
        script.version,
        script.status,
        script.origin,
        script.baseScriptId ?? null,
        script.codeSnapshot ?? null,
        JSON.stringify(script.selectorMap),
        script.createdAt,
      ]
    )
  }
}
