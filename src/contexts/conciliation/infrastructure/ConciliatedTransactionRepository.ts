import { PoolClient } from 'pg'
import { db } from '../../../shared/infrastructure/db/client.js'
import { ConciliatedTransactionData, IConciliatedTransactionRepository } from '../domain/IConciliatedTransactionRepository.js'

export class ConciliatedTransactionRepository implements IConciliatedTransactionRepository {
  constructor(private readonly client?: PoolClient) {}

  private get executor() {
    return this.client ?? db
  }

  async save(match: ConciliatedTransactionData): Promise<void> {
    await this.executor.query(
      `INSERT INTO conciliated_transactions
         (id, account_id, request_id, bank_transaction_id, matched_by, is_primary, matched_at, created_at, is_notified)
       VALUES ($1,$2,$3,$4,'engine',true,now(),now(),false)`,
      [
        match.id,
        match.accountId,
        match.requestId,
        match.bankTransactionId,
      ]
    )
  }
}
