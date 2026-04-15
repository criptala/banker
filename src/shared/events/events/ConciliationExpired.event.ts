import { DomainEvent } from '../DomainEvent.js'

export class ConciliationExpiredEvent implements DomainEvent {
  readonly eventType = 'ConciliationExpired'
  readonly occurredAt = new Date()

  constructor(
    readonly aggregateId: string,
    readonly accountId: string,
  ) {}
}
