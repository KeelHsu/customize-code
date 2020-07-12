/**
 * simple pub/sub event
 */

export default event = {
  events: {},

  on(name, handler) {
    if (typeof name !== 'string' || typeof handler !== 'function') {
      return;
    }

    this.events[name] = this.events[name] || [];
    this.events[name].push(handler);
  },

  once(name, handler) {
    if (typeof handler !== 'function') {
      return;
    }

    handler.once = true;
    this.on(name, handler);
  },

  emit(name, args) {
    let handlers = this.events[name];

    if (!handlers || !handlers.length) {
      return;
    }

    handlers.forEach(handler => {
      handler.once && this.remove(name, handler);
      handler(args);
    });
  },

  remove(name, handler) {
    let handlers = this.events[name];

    if (!handlers || !handlers.length) {
      return;
    }

    if (!handler) {
      handlers.length = 0;
    } else {
      let index = handlers.indexOf(handler);
      index !== -1 && handlers.splice(index, 1);
    }
  }
}
