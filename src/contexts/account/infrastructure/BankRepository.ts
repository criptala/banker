import { db } from '../../../shared/infrastructure/db/client.js'
import { Bank } from '../domain/Bank.js'
import { IBankRepository } from '../domain/IBankRepository.js'

function rowToBank(row: any): Bank {
  return Bank.reconstitute(row.id, {
    code: row.code,
    name: row.name,
    loginUrl: row.login_url ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  })
}

export class BankRepository implements IBankRepository {
  async findById(id: string): Promise<Bank | null> {
    const { rows } = await db.query('SELECT * FROM banks WHERE id = $1', [id])
    return rows[0] ? rowToBank(rows[0]) : null
  }

  async findAll(): Promise<Bank[]> {
    const { rows } = await db.query('SELECT * FROM banks ORDER BY name')
    return rows.map(rowToBank)
  }

  async save(bank: Bank): Promise<void> {
    await db.query(
      `INSERT INTO banks (id, code, name, login_url, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name      = $3,
         login_url = $4,
         status    = $5`,
      [bank.id, bank.code, bank.name, bank.loginUrl ?? null, bank.status, bank.createdAt]
    )
  }
}
