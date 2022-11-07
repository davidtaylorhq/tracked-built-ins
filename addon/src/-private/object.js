import {
  createStorage,
  getValue,
  setValue,
} from 'ember-tracked-storage-polyfill';

import { PropertyStorageMap } from './property-storage-map';
import { cloneObjectWithAccessors } from './utils';

export default class TrackedObject {
  static fromEntries(entries) {
    return new TrackedObject(Object.fromEntries(entries));
  }

  constructor(obj = {}) {
    const clone = cloneObjectWithAccessors(obj);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let self = this;

    let p = new Proxy(clone, {
      get(target, prop) {
        self.#values.consume(prop);
        return target[prop];
      },

      has(target, prop) {
        self.#values.consume(prop);
        return prop in target;
      },

      ownKeys(target) {
        getValue(self.#iteration);
        return Reflect.ownKeys(target);
      },

      set(target, prop, value) {
        if (!(prop in target)) {
          self.#dirtyKeys();
        }
        target[prop] = value;
        self.#values.update(prop);
        return true;
      },

      deleteProperty(target, prop) {
        if (prop in target) {
          delete target[prop];
          self.#values.update(prop);
          self.#dirtyKeys();
        }
        return true;
      },

      getPrototypeOf() {
        return TrackedObject.prototype;
      },
    });

    this.#values = new PropertyStorageMap(p);

    return p;
  }

  #iteration = createStorage(null, () => false);
  #values;

  #dirtyKeys() {
    setValue(this.#iteration, null);
  }
}
