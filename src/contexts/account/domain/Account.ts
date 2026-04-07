import { AggregateRoot } from '../../../shared/domain/AggregateRoot.js'
import { AccountCreatedEvent } from '../../../shared/events/events/AccountCreated.event.js'

export type AccountStatus = 'active' | 'inactive'

interface AccountProps {
  bankId: string
  bank: string    // bank code, resolved from JOIN with banks table
  name?: string
  status: AccountStatus
  createdAt: Date
}

export class Account extends AggregateRoot<string> {
  private props: AccountProps

  private constructor(id: string, props: AccountProps) {
    super(id)
    this.props = props
  }

  static create(id: string, bankId: string, bankCode: string, name?: string): Account {
    const account = new Account(id, { bankId, bank: bankCode, name, status: 'active', createdAt: new Date() })
    account.addDomainEvent(new AccountCreatedEvent(id, bankCode, name))
    return account
  }

  static reconstitute(id: string, props: AccountProps): Account {
    return new Account(id, props)
  }

  get bankId()  { return this.props.bankId }
  get bank()    { return this.props.bank }
  get name()    { return this.props.name }
  get status()  { return this.props.status }
}
