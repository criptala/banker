import { DomainEvent } from '../DomainEvent.js'

export class ConciliationFailedEvent implements DomainEvent {
  readonly eventType = 'ConciliationFailed'
  readonly occurredAt = new Date()

  constructor(
    readonly aggregateId: string,
    readonly accountId: string,
    readonly failureType: 'not_found' | 'ambiguous' | 'system_error',
  ) {}
}
