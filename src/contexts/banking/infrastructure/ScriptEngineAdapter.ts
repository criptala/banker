import { ScriptLoader } from '../../script-engine/infrastructure/ScriptLoader.js'
import { PlaywrightRunner } from '../../script-engine/infrastructure/PlaywrightRunner.js'
import { ActiveScript, IScriptEnginePort, ScrapedTransaction } from '../domain/IScriptEnginePort.js'

export class ScriptEngineAdapter implements IScriptEnginePort {
  async loadActiveScript(bank: string, flowType: string): Promise<ActiveScript | null> {
    const script = await ScriptLoader.loadActive(bank, flowType as any)
    if (!script || !script.codeSnapshot) return null
    return { id: script.id, codeSnapshot: script.codeSnapshot }
  }

  async runScript(
    script: ActiveScript,
    context: { accountId: string; lastExternalId: string | null }
  ): Promise<ScrapedTransaction[]> {
    // PlaywrightRunner expects a BankScript-like object with codeSnapshot and id
    const runner = new PlaywrightRunner()
    return runner.execute({ id: script.id, codeSnapshot: script.codeSnapshot } as any, context)
  }
}
