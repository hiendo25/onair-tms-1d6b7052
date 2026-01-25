import type { EventMap } from "./event.types";

type EventKey = keyof EventMap;
type EventHandler<K extends EventKey> = (payload: EventMap[K]) => void | Promise<void>;

export class EventBus {
  private listeners = new Map<EventKey, Set<EventHandler<any>>>();

  on<K extends EventKey>(event: K, handler: EventHandler<K>) {
    const handlers = this.listeners.get(event) ?? new Set();

    if (process.env.NODE_ENV !== "production") {
      console.log(`[EventBus] register "${event}" | before: ${handlers.size}`);
    }

    handlers.add(handler);
    this.listeners.set(event, handlers);

    if (process.env.NODE_ENV !== "production") {
      console.log(`[EventBus] register "${event}" | after: ${handlers.size}`);
    }

    return () => {
      handlers.delete(handler);
    };
  }

  once<K extends EventKey>(event: K, handler: EventHandler<K>) {
    const off = this.on(event, async (payload) => {
      await handler(payload);
      off();
    });

    return off;
  }

  emit<K extends EventKey>(event: K, payload: EventMap[K]) {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(`[EventBus] Error in handler for "${event}"`, error);
        }
      }
    });
  }

  clear(event?: EventKey) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
