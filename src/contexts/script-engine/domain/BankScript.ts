import { AggregateRoot } from '../../../shared/domain/AggregateRoot.js'

export type ScriptStatus = 'draft' | 'testing' | 'review' | 'active' | 'deprecated' | 'failed'
export type ScriptOrigin = 'system' | 'ai' | 'user'
export type FlowType = 'login' | 'extract_transactions' | 'verify_payment'

interface Props {
  bank: string
  flowType: FlowType
  version: string
  status: ScriptStatus
  origin: ScriptOrigin
  baseScriptId?: string
  codeSnapshot?: string
  selectorMap: Record<string, unknown>
  createdAt: Date
}

export class BankScript extends AggregateRoot<string> {
  private props: Props

  private constructor(id: string, props: Props) {
    super(id)
    this.props = props
  }

  static create(id: string, props: Omit<Props, 'createdAt'>): BankScript {
    return new BankScript(id, { ...props, createdAt: new Date() })
  }

  static reconstitute(id: string, props: Props): BankScript {
    return new BankScript(id, props)
  }

  get bank()         { return this.props.bank }
  get flowType()     { return this.props.flowType }
  get version()      { return this.props.version }
  get status()       { return this.props.status }
  get origin()       { return this.props.origin }
  get baseScriptId() { return this.props.baseScriptId }
  get codeSnapshot() { return this.props.codeSnapshot }
  get selectorMap()  { return this.props.selectorMap }
  get createdAt()    { return this.props.createdAt }

  promote(): void {
    if (this.props.status !== 'review') throw new Error('Only scripts in review can be promoted')
    this.props.status = 'active'
  }
}
