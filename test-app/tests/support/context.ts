import { TestContext } from '@ember/test-helpers';

export function context<T>(
  test: (ctx: TestContext & T, assert: Assert) => void | Promise<void>
): (assert: Assert) => void | Promise<void> {
  return function (this: TestContext & T, assert: Assert) {
    return test(this, assert);
  };
}
