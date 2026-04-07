import { Entity } from './Entity.js'
import { DomainEvent } from '../events/DomainEvent.js'

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = []

  get domainEvents(): DomainEvent[] {
    return this._domainEvents
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }

  clearDomainEvents(): void {
    this._domainEvents = []
  }
}
