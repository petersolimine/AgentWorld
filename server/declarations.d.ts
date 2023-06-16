// File: declarations.d.ts
declare module "collections/deque" {
  class Deque<T> {
    constructor(array?: T[], maxLength?: number);

    push(item: T): void;
    toArray(): T[];
  }

  export = Deque;
}
