import { EventBus } from '../../../shared/events/EventBus.js'
import { ScrapeRunFailedEvent } from '../../../shared/events/events/ScrapeRunFailed.event.js'
import { IAccountRepository } from '../../account/domain/IAccountRepository.js'
import { AccountRepository } from '../../account/infrastructure/AccountRepository.js'
import { BankTransaction } from '../domain/BankTransaction.js'
import { IBankTransactionRepository } from '../domain/IBankTransactionRepository.js'
import { IScriptEnginePort } from '../domain/IScriptEnginePort.js'
import { IScrapeRunRepository } from '../domain/IScrapeRunRepository.js'
import { BankTransactionRepository } from '../infrastructure/BankTransactionRepository.js'
import { ScriptEngineAdapter } from '../infrastructure/ScriptEngineAdapter.js'
import { ScrapeRunRepository } from '../infrastructure/ScrapeRunRepository.js'
import crypto from 'crypto'

interface JobData { accountId: string }

export class RunBankScrapeUseCase {
  constructor(
    private readonly accountRepo: IAccountRepository = new AccountRepository(),
    private readonly txRepo: IBankTransactionRepository = new BankTransactionRepository(),
    private readonly scrapeRunRepo: IScrapeRunRepository = new ScrapeRunRepository(),
    private readonly scriptEngine: IScriptEnginePort = new ScriptEngineAdapter(),
  ) {}

  async execute({ accountId }: JobData): Promise<void> {
    const account = await this.accountRepo.findById(accountId)
    if (!account) throw new Error(`Account ${accountId} not found`)

    const lastExternalId = await this.txRepo.findLatestExternalId(accountId)

    const script = await this.scriptEngine.loadActiveScript(account.bank, 'extract_transactions')
    if (!script) throw new Error(`No active script for ${account.bank}:extract_transactions`)

    const runId = crypto.randomUUID()
    await this.scrapeRunRepo.create(runId, accountId, script.id)

    try {
      const transactions = await this.scriptEngine.runScript(script, { accountId, lastExternalId })

      for (const tx of transactions) {
        const exists = await this.txRepo.findByExternalId(accountId, tx.externalId)
        if (exists) continue

        const bankTx = BankTransaction.create(crypto.randomUUID(), {
          accountId,
          externalId: tx.externalId,
          referenceHash: tx.referenceHash,
          amount: tx.amount,
          currency: tx.currency,
          senderName: tx.senderName,
          receivedAt: tx.receivedAt,
          scriptId: script.id,
          rawPayload: tx.raw,
        })
        await this.txRepo.save(bankTx)
        await EventBus.publishAll(bankTx.domainEvents)
        bankTx.clearDomainEvents()
      }

      await this.scrapeRunRepo.markSuccess(runId, transactions.length)
    } catch (err: any) {
      await this.scrapeRunRepo.markFailed(runId, err.message)
      await EventBus.publish(
        new ScrapeRunFailedEvent(runId, accountId, script.id, 'unknown', err.message)
      )
      throw err
    }
  }
}
