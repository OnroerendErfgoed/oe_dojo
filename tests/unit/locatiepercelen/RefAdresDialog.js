define([
  'intern!object',
  'intern/chai!assert',
  'oe_dojo/RefAdresDialog'
], function (
  registerSuite,
  assert,
  RefAdresDialog
) {

  registerSuite({
    name: 'RefAdresDialog',

    'RefAdresDialog canary test': function() {
     assert.strictEqual(1, 1, 'Canary test should pass.');
    }
  });
});