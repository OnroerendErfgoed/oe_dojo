define([
  'intern!object',
  'intern/chai!assert'
  //'oe_dojo/ArcheologieportaalDialog'
], function (
  registerSuite,
  assert
  //ArcheologieportaalDialog
) {

  registerSuite({
    name: 'ArcheologieportaalDialog',

    'ArcheologieportaalDialog canary test': function() {
     assert.strictEqual(1, 1, 'Canary test should pass.');
    }
  });
});
