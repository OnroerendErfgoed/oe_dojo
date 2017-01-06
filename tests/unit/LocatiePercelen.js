define([
  'intern!object',
  'intern/chai!assert',
  'oe_dojo/LocatiePercelen'
], function (
  registerSuite,
  assert,
  LocatiePercelen
) {

  registerSuite({
    name: 'LocatiePercelen',

    'LocatiePercelen canary test': function() {
     assert.strictEqual(1, 1, 'Canary test should pass.');
    }
  });
});