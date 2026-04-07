import { Bank } from './Bank.js'

export interface IBankRepository {
  findById(id: string): Promise<Bank | null>
  findAll(): Promise<Bank[]>
  save(bank: Bank): Promise<void>
}
