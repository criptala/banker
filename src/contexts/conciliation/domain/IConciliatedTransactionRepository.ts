export interface ConciliatedTransactionData {
  id: string
  accountId: string
  requestId: string
  bankTransactionId: string
}

export interface IConciliatedTransactionRepository {
  save(match: ConciliatedTransactionData): Promise<void>
}
