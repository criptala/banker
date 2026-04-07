import { DomainEvent } from './DomainEvent.js'

type Handler<T extends DomainEvent> = (event: T) => Promise<void>

class EventBusImpl {
  private handlers = new Map<string, Handler<any>[]>()

  subscribe<T extends DomainEvent>(eventType: string, handler: Handler<T>): void {
    const existing = this.handlers.get(eventType) ?? []
    this.handlers.set(eventType, [...existing, handler])
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? []
    await Promise.all(handlers.map(h => h(event)))
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map(e => this.publish(e)))
  }
}

export const EventBus = new EventBusImpl()
