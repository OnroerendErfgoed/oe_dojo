define([
  'intern!object',
  'intern/chai!assert'
  //'oe_dojo/SelectionDialog'
], function (
  registerSuite,
  assert
  //SelectionDialog
) {

  registerSuite({
    name: 'SelectionDialog',

    'SelectionDialog canary test': function() {
     assert.strictEqual(1, 1, 'Canary test should pass.');
    }
  });
});
