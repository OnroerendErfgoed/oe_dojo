define([
  'intern!object',
  'intern/chai!assert'
  //'oe_dojo/LocatieService.js'
], function (
  registerSuite,
  assert
  //LocatieService
) {

  registerSuite({
    name: 'LocatieService',

    'LocatieService canary test': function() {
      assert.strictEqual(1, 1, 'Canary test should pass.');
    }
  });
});