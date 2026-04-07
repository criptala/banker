import { AggregateRoot } from '../../../shared/domain/AggregateRoot.js'
import { TransactionIngestedEvent } from '../../../shared/events/events/TransactionIngested.event.js'

interface Props {
  accountId: string
  externalId: string
  referenceHash: string
  amount: number
  currency: string
  senderName?: string
  receivedAt: Date
  scriptId: string
  ingestedAt: Date
  rawPayload: Record<string, unknown>
}

export class BankTransaction extends AggregateRoot<string> {
  private props: Props

  private constructor(id: string, props: Props) {
    super(id)
    this.props = props
  }

  static create(id: string, props: Omit<Props, 'ingestedAt'>): BankTransaction {
    const tx = new BankTransaction(id, { ...props, ingestedAt: new Date() })
    tx.addDomainEvent(new TransactionIngestedEvent(id, props.accountId, props.amount, props.currency, props.receivedAt))
    return tx
  }

  static reconstitute(id: string, props: Props): BankTransaction {
    return new BankTransaction(id, props)
  }

  get accountId()      { return this.props.accountId }
  get externalId()     { return this.props.externalId }
  get referenceHash()  { return this.props.referenceHash }
  get amount()         { return this.props.amount }
  get currency()       { return this.props.currency }
  get senderName()     { return this.props.senderName }
  get receivedAt()     { return this.props.receivedAt }
  get scriptId()       { return this.props.scriptId }
  get ingestedAt()     { return this.props.ingestedAt }
  get rawPayload()     { return this.props.rawPayload }
}
