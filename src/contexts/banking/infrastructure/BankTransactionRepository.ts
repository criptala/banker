import { db } from '../../../shared/infrastructure/db/client.js'
import { BankTransaction } from '../domain/BankTransaction.js'
import { IBankTransactionRepository } from '../domain/IBankTransactionRepository.js'

export class BankTransactionRepository implements IBankTransactionRepository {
  async findByExternalId(accountId: string, externalId: string): Promise<BankTransaction | null> {
    const { rows } = await db.query(
      'SELECT * FROM bank_transactions WHERE account_id=$1 AND external_id=$2',
      [accountId, externalId]
    )
    if (!rows[0]) return null
    return BankTransaction.reconstitute(rows[0].id, {
      accountId: rows[0].account_id,
      externalId: rows[0].external_id,
      referenceHash: rows[0].reference_hash,
      amount: Number(rows[0].amount),
      currency: rows[0].currency,
      senderName: rows[0].sender_name ?? undefined,
      receivedAt: rows[0].received_at,
      scriptId: rows[0].script_id,
      ingestedAt: rows[0].ingested_at,
      rawPayload: rows[0].raw_payload,
    })
  }

  async findLatestExternalId(accountId: string): Promise<string | null> {
    const { rows } = await db.query(
      `SELECT external_id FROM bank_transactions WHERE account_id = $1 ORDER BY received_at DESC LIMIT 1`,
      [accountId]
    )
    return rows[0]?.external_id ?? null
  }

  async save(tx: BankTransaction): Promise<void> {
    await db.query(
      `INSERT INTO bank_transactions
         (id, account_id, external_id, reference_hash, amount, currency, sender_name, received_at, script_id, ingested_at, raw_payload)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,now(),$10)
       ON CONFLICT (account_id, external_id) DO NOTHING`,
      [
        tx.id,
        tx.accountId,
        tx.externalId,
        tx.referenceHash,
        tx.amount,
        tx.currency,
        tx.senderName ?? null,
        tx.receivedAt,
        tx.scriptId,
        JSON.stringify(tx.rawPayload),
      ]
    )
  }
}
