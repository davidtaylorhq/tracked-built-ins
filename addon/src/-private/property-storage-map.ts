import { consumeProperty, dirtyProperty } from './validator-versions';

export class PropertyStorageMap {
  readonly #object: object;

  constructor(object: object) {
    this.#object = object;
  }

  consume(key: string | symbol) {
    consumeProperty(this.#object, key);
  }

  update(key: string | symbol) {
    dirtyProperty(this.#object, key);
  }
}
