import { DomainEvent } from '../DomainEvent.js'

export class TransactionIngestedEvent implements DomainEvent {
  readonly eventType = 'TransactionIngested'
  readonly occurredAt = new Date()

  constructor(
    readonly aggregateId: string,
    readonly accountId: string,
    readonly amount: number,
    readonly currency: string,
    readonly receivedAt: Date,
  ) {}
}
