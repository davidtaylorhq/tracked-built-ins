import { consumeTag, tagFor, dirtyTagFor } from '@glimmer/validator';

export class PropertyStorageMap {
  readonly #object: object;

  constructor(object: object) {
    this.#object = object;
  }

  consume(key: string | symbol) {
    consumeTag(tagFor(this.#object, key as string | symbol));
  }

  update(key: string | symbol) {
    dirtyTagFor(this.#object, key as string | symbol);
  }
}
