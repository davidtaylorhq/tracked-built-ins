import * as validator from '@glimmer/validator';

type Tag = object;

// v0.84
interface V84 {
  consumeTag: (tag: Tag) => void;
  tagFor: (object: object, property: PropertyKey) => Tag;
  dirtyTagFor: (object: object, property: PropertyKey) => void;
}

// v0.44
interface V44 {
  consume: (tag: Tag) => void;
  tagFor: (object: object, property: PropertyKey) => Tag;
  dirty: (tag: Tag) => void;
}

type ValidatorVersions = V84 | V44;

function isV84(validator: ValidatorVersions): validator is V84 {
  return (
    'consumeTag' in validator &&
    typeof validator.consumeTag === 'function' &&
    'tagFor' in validator &&
    typeof validator.tagFor === 'function' &&
    'dirtyTagFor' in validator &&
    typeof validator.dirtyTagFor === 'function'
  );
}

interface Validator {
  dirtyProperty: (object: object, property: PropertyKey) => void;
  consumeProperty: (object: object, property: PropertyKey) => void;
}

function normalize(module: ValidatorVersions): Validator {
  if (isV84(module)) {
    return {
      dirtyProperty: (object: object, property: PropertyKey) => {
        module.dirtyTagFor(object, property);
      },
      consumeProperty: (object: object, property: PropertyKey) => {
        module.consumeTag(module.tagFor(object, property));
      },
    };
  } else {
    throw new Error(
      'The version of @glimmer/validator included with this build is incompatible with @ember-compat/tracked-built-ins. '
    );
  }
}

const { dirtyProperty, consumeProperty } = normalize(
  validator as ValidatorVersions
);

export { dirtyProperty, consumeProperty };
