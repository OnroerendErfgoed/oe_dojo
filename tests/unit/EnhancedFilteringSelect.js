define([
  'intern!object',
  'intern/chai!assert',
  'oe_dojo/EnhancedFilteringSelect',
  'dojo/dom-construct',
  'dojo/store/Memory'
], function (
  registerSuite,
  assert,
  EnhancedFilteringSelect,
  domContruct,
  Memory
) {

  var enhancedFilteringSelect;

  registerSuite({
    name: 'EnhancedFilteringSelect',

    beforeEach: function() {
      var testStore = new Memory({
        data: [
          { name:'test1', id:'1' },
          { name:'test2', id:'2' },
          { name:'drie', id:'3' }
        ]
      });
      enhancedFilteringSelect = new EnhancedFilteringSelect({
        store: testStore,
        searchAttr: 'name'
      }, domContruct.create('div'));

      enhancedFilteringSelect.startup();
    },

    afterEach: function() {
      enhancedFilteringSelect.destroyRecursive();
    },

    'EnhancedFilteringSelect canary test': function() {
      assert.strictEqual(1, 1, 'Canary test should pass.');
    },

    'EnhancedFilteringSelect on start': function() {
      assert.strictEqual(enhancedFilteringSelect.get('value'), '',
        'EnhancedFilteringSelect should not return data on start');
      assert.strictEqual(enhancedFilteringSelect.dropDown, null,
        'EnhancedFilteringSelect dropdown should not be visible on start');
    },

    'EnhancedFilteringSelect set value': function() {
      enhancedFilteringSelect.set('value', '1');
      assert.strictEqual(enhancedFilteringSelect.get('value'), '1',
        'EnhancedFilteringSelect should return the selected value');
    }
  });
});