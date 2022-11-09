export function isAccessorDescriptor(descriptor: PropertyDescriptor) {
  return 'get' in descriptor || 'set' in descriptor;
}

export function cloneObjectWithAccessors<
  T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>
>(obj: T): T {
  const proto = Object.getPrototypeOf(obj);
  const clone = Object.create(proto);
  const shadow = {};

  for (const key of Reflect.ownKeys(obj)) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (descriptor) {
      if (isAccessorDescriptor(descriptor)) {
        Object.defineProperty(clone, key, descriptor);
      } else {
        Reflect.set(shadow, key, Reflect.get(obj, key));
        Object.defineProperty(clone, key, {
          configurable: descriptor.configurable,
          enumerable: true,
          get: () => {
            return Reflect.get(shadow, key);
          },
          set: (value) => {
            Reflect.set(shadow, key, value);
          },
        });
      }
    }
  }

  return clone;
}
