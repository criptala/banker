import { BankScript, FlowType } from './BankScript.js'

export interface IBankScriptRepository {
  findActive(bank: string, flowType: FlowType): Promise<BankScript | null>
  findById(id: string): Promise<BankScript | null>
  save(script: BankScript): Promise<void>
}
