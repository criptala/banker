import { IBankScriptRepository } from '../domain/IBankScriptRepository.js'
import { BankScriptRepository } from '../infrastructure/BankScriptRepository.js'
import { db } from '../../../shared/infrastructure/db/client.js'

interface Input { scriptId: string }

export class PromoteScriptUseCase {
  constructor(
    private readonly scriptRepo: IBankScriptRepository = new BankScriptRepository(),
  ) {}

  async execute({ scriptId }: Input): Promise<void> {
    const script = await this.scriptRepo.findById(scriptId)
    if (!script) throw new Error(`Script ${scriptId} not found`)

    // Deprecate the current active script for this bank+flowType
    await db.query(
      `UPDATE bank_scripts SET status='deprecated' WHERE bank=$1 AND flow_type=$2 AND status='active'`,
      [script.bank, script.flowType]
    )

    script.promote()
    await this.scriptRepo.save(script)
  }
}
