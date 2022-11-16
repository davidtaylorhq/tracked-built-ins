'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    autoImport: {
      forbidEval: true,
      watchDependencies: ['@ember-compat/tracked-built-ins'],
    },
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app, {
    packageRules: [
      {
        package: 'test-app',
        components: {
          '{{test-component}}': {
            safeToIgnore: true,
          },
        },
      },
    ],
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
};
