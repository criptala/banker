import { DomainEvent } from '../DomainEvent.js'

export class AccountCreatedEvent implements DomainEvent {
  readonly eventType = 'AccountCreated'
  readonly occurredAt = new Date()

  constructor(
    readonly aggregateId: string,
    readonly bank: string,
    readonly name: string | undefined,
  ) {}
}
