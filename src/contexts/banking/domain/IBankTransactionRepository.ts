import { BankTransaction } from './BankTransaction.js'

export interface IBankTransactionRepository {
  findById(id: string, opts?: { forUpdate?: boolean }): Promise<BankTransaction | null>
  findByExternalId(accountId: string, externalId: string): Promise<BankTransaction | null>
  findLatestExternalId(accountId: string): Promise<string | null>
  save(tx: BankTransaction): Promise<void>
  markExcluded(id: string): Promise<void>
  isExcluded(id: string): Promise<boolean>
}
