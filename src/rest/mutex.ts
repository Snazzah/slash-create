/**
 * A simple tool to synchronize async operations.
 */
export class Mutex {
  #queue: ((value: unknown) => void)[] = [];

  /**
   * Whether the mutex instance is locked.
   */
  get locked() {
    return this.#queue.length > 0;
  }

  /**
   * Returns a promise that will resolve as soon as the mutex is unlocked.
   * @arg next Whether to insert the promise at the start of the queue.
   */
  acquire(next?: boolean) {
    const isLocked = this.locked;
    const promise = new Promise((resolve) => {
      if (next) return this.#queue.unshift(resolve);
      this.#queue.push(resolve);
    });

    if (!isLocked) this.#dispatch();
    return promise;
  }

  /**
   * Returns a promise that will resolve after `ms` miliseconds.
   * @static
   */
  static wait(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  #dispatch() {
    const resolve = this.#queue.shift();
    if (!resolve) return;

    let released = false;
    resolve(() => {
      if (released) return;
      released = true;
      this.#dispatch();
    });
  }
}
