define([
  'intern!object',
  'intern/chai!assert'
  //'oe_dojo/EnhancedFilteringSelect'
], function (
  registerSuite,
  assert
  //EnhancedFilteringSelect
) {

  registerSuite({
    name: 'EnhancedFilteringSelect',

    'EnhancedFilteringSelect canary test': function() {
     assert.strictEqual(1, 1, 'Canary test should pass.');
    }
  });
});