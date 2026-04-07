import { AggregateRoot } from '../../../shared/domain/AggregateRoot.js'

export type BankStatus = 'pending' | 'ready' | 'failed'

interface BankProps {
  code: string
  name: string
  loginUrl?: string
  status: BankStatus
  createdAt: Date
}

export class Bank extends AggregateRoot<string> {
  private props: BankProps

  private constructor(id: string, props: BankProps) {
    super(id)
    this.props = props
  }

  static create(id: string, code: string, name: string, loginUrl?: string): Bank {
    return new Bank(id, { code, name, loginUrl, status: 'pending', createdAt: new Date() })
  }

  static reconstitute(id: string, props: BankProps): Bank {
    return new Bank(id, props)
  }

  get code()      { return this.props.code }
  get name()      { return this.props.name }
  get loginUrl()  { return this.props.loginUrl }
  get status()    { return this.props.status }
  get createdAt() { return this.props.createdAt }
}
