import { BankTransaction } from './BankTransaction.js'

export interface IBankTransactionRepository {
  findByExternalId(accountId: string, externalId: string): Promise<BankTransaction | null>
  findLatestExternalId(accountId: string): Promise<string | null>
  save(tx: BankTransaction): Promise<void>
}
