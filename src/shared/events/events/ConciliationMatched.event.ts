import { DomainEvent } from '../DomainEvent.js'

export class ConciliationMatchedEvent implements DomainEvent {
  readonly eventType = 'ConciliationMatched'
  readonly occurredAt = new Date()

  constructor(
    readonly aggregateId: string,
    readonly accountId: string,
    readonly bankTransactionId: string,
  ) {}
}
