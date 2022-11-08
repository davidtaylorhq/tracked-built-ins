import {
  createStorage,
  getValue,
  setValue,
  TrackedStorage,
} from 'ember-tracked-storage-polyfill';
import { PropertyStorageMap } from './property-storage-map';
import { cloneObjectWithAccessors } from './utils';

function TrackedObjectImpl(obj = {}) {
  if (new.target === undefined) {
    throw new Error('TrackedObject must be called with `new`');
  }

  const prototype = new.target.prototype as object;
  const clone = cloneObjectWithAccessors(obj);
  const iteration = createStorage(null, () => false);

  const proxy = new Proxy(clone, {
    get(target, prop) {
      values.consume(prop);
      return Reflect.get(target, prop);
    },

    getPrototypeOf() {
      return prototype;
    },

    setPrototypeOf() {
      throw new Error('Cannot set prototype of TrackedObject');
    },

    has(target, prop) {
      values.consume(prop);
      return Reflect.has(target, prop);
    },

    ownKeys(target) {
      getValue(iteration);
      return Reflect.ownKeys(target);
    },

    set(target, prop, value, receiver) {
      dirtyIteration(iteration);
      values.update(prop);
      Reflect.set(target, prop, value, receiver);
      return true;
    },

    deleteProperty(target, prop) {
      const desc = Reflect.getOwnPropertyDescriptor(target, prop);
      if (desc && desc.configurable === true) {
        values.update(prop);
        dirtyIteration(iteration);
      }
      Reflect.deleteProperty(target, prop);
      return true;
    },

    // Not-yet-overridden methods from the ProxyHandler interface:
    //
    // apply?(target: T, thisArg: any, argArray: any[]): any;
    // construct?(target: T, argArray: any[], newTarget: Function): object;
    // defineProperty?(target: T, property: string | symbol, attributes: PropertyDescriptor): boolean;
    // getOwnPropertyDescriptor?(target: T, p: string | symbol): PropertyDescriptor | undefined;
    // isExtensible?(target: T): boolean;
    // preventExtensions?(target: T): boolean;
  });

  const values = new PropertyStorageMap(proxy);

  return proxy;
}

function dirtyIteration(iteration: TrackedStorage<null>) {
  setValue(iteration, null);
}

TrackedObjectImpl.fromEntries = <T>(
  entries: Iterable<readonly [PropertyKey, T]>
): Record<PropertyKey, T> => {
  return new TrackedObject(Object.fromEntries(entries));
};

interface TrackedObjectClass {
  /**
   * Returns an object created by key-value entries for properties and methods
   * @param entries An iterable object that contains key-value entries for properties and methods.
   *
   * Note: interface matches the built-in types, which use `any`, for maximum compat.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromEntries<T = any>(
    entries: Iterable<readonly [PropertyKey, T]>
  ): { [k: string]: T };

  /**
   * Returns an object created by key-value entries for properties and methods
   * @param entries An iterable object that contains key-value entries for properties and methods.
   *
   * Note: interface matches the built-in types, which use `any`, for maximum compat.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromEntries<T>(entries: Iterable<readonly [any, T][]>): Record<string, T>;

  new <T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>>(
    obj?: T
  ): T;
}

const TrackedObject = TrackedObjectImpl as unknown as TrackedObjectClass;

// eslint-disable-next-line @typescript-eslint/ban-types
type TrackedObject<T = {}> = T;

export default TrackedObject;
