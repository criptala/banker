import { DomainEvent } from '../DomainEvent.js'

export class ScrapeRunFailedEvent implements DomainEvent {
  readonly eventType = 'ScrapeRunFailed'
  readonly occurredAt = new Date()

  constructor(
    readonly aggregateId: string,
    readonly accountId: string,
    readonly scriptId: string,
    readonly failureType: string,
    readonly errorMessage: string,
  ) {}
}
