define([
  'intern!object',
  'intern/chai!assert',
  'oe_dojo/DomUtils',
  'dojo/dom-construct',
  'dojo/_base/array'
], function (
  registerSuite,
  assert,
  DomUtils,
  domConstruct,
  array
) {

  var singleSelect;

  registerSuite({
    name: 'DomUtils',

    beforeEach: function() {
      singleSelect = domConstruct.create('select');
      domConstruct.create('option', { value: 1, innerHTML: 'option 1'}, singleSelect);
      domConstruct.create('option', { value: 2, innerHTML: 'option 2'}, singleSelect);
      domConstruct.create('option', { value: 3, innerHTML: 'option 3'}, singleSelect);
    },

    afterEach: function() {
      domConstruct.destroy(singleSelect);
    },

    'getSelectedOption': function() {
      assert.strictEqual(DomUtils.getSelectedOption(singleSelect), '1',
        'getSelectedOption should return first option when nothing selected');

      // add selected option to select
      domConstruct.create('option', { value: 4, innerHTML: 'option 4', selected: 'selected'}, singleSelect);

      assert.strictEqual(DomUtils.getSelectedOption(singleSelect), '4',
        'getSelectedOption should return the value of the selected option');
    },

    'getSelectedOptionLabel': function() {
      // test withou selected option;
      assert.strictEqual(DomUtils.getSelectedOptionLabel(singleSelect), 'option 1',
        'getSelectedOption should return label of first option when nothing selected');

      // add selected option to select
      domConstruct.create('option', { value: 4, innerHTML: 'option 4', selected: 'selected'}, singleSelect);

      assert.strictEqual(DomUtils.getSelectedOptionLabel(singleSelect), 'option 4',
        'getSelectedOption should return the label of the selected option');
    },

    'setSelectedOptions singleselect': function () {
      // set option 2 selected
      DomUtils.setSelectedOptions(singleSelect, ['2']);

      assert.strictEqual(singleSelect.options[singleSelect.selectedIndex].value, '2',
        'setSelectedOptions should have selected the correct options');

      // set no option selected
      DomUtils.setSelectedOptions(singleSelect, []);

      assert.strictEqual(singleSelect.options[singleSelect.selectedIndex].value, '1',
        'setSelectedOptions should have selected no option, so the first option should be selected');
    },

    'setSelectedOptions multiselect': function () {
      var select = domConstruct.create('select', { multiple: 'multiple'});
      domConstruct.create('option', { value: 1, innerHTML: 'option 1'}, select);
      domConstruct.create('option', { value: 2, innerHTML: 'option 2'}, select);
      domConstruct.create('option', { value: 3, innerHTML: 'option 3'}, select);
      // set option 2 and 3 selected
      DomUtils.setSelectedOptions(select, ['2', '3']);

      assert.sameMembers(array.map(select.selectedOptions, function(option) { return option.value; }),
        ['2', '3'], 'setSelectedOptions should have selected the correct options');

      // set no option selected
      DomUtils.setSelectedOptions(select, []);

      assert.sameMembers(array.map(select.selectedOptions, function(option) { return option.value; }),
        [], 'setSelectedOptions should have selected no options');
    },

    'resetSelectOptions': function() {
      // reset select options
      DomUtils.resetSelectOptions(singleSelect);

      assert.lengthOf(singleSelect.options, 0, 'resetSelectOptions should have removed all options');
    },

    'addSelectOptions': function() {
      var select = domConstruct.create('select');
      var options = {
        data: [],
        idProperty: 'id',
        labelProperty: 'label'
      };
      // add options with empty data
      DomUtils.addSelectOptions(select, options);
      assert.lengthOf(select.options, 0, 'addSelectOptions should have added no options');

      // add options with 3 elements in data
      options.data = [{id: 1, label: 'option 1'}, {id: 2, label: 'option 2'}, {id: 3, label: 'option 3'}];
      DomUtils.addSelectOptions(select, options);
      assert.lengthOf(select.options, 3, 'addSelectOptions should have added 3 options');
    },

    'addSelectOptionsWithPlaceholder': function() {
      var select = domConstruct.create('select');
      var options = {
        data: [],
        idProperty: 'id',
        labelProperty: 'label',
        placeholder: 'select placeholder'
      };
      DomUtils.addSelectOptionsWithPlaceholder(select, options);

      // check if placeholder is set with empty data
      assert.lengthOf(select.options, 1, 'addSelectOptionsWithPlaceholder should have added 1 option (placeholder)');
      assert.strictEqual(select.options[select.selectedIndex].label, 'select placeholder',
        'addSelectOptionsWithPlaceholder should have selected the placeholder option');

      // check default placeholder
      delete options.placeholder;
      DomUtils.addSelectOptionsWithPlaceholder(select, options);
      assert.lengthOf(select.options, 1, 'addSelectOptionsWithPlaceholder should have added 1 option (placeholder)');
      assert.strictEqual(select.options[select.selectedIndex].label, 'Kies een optie...',
        'addSelectOptionsWithPlaceholder should have selected the default placeholder option');

      // check placeholder + data
      options.placeholder = 'select with data';
      options.data = [{id: 1, label: 'option 1'}, {id: 2, label: 'option 2'}, {id: 3, label: 'option 3'}];
      DomUtils.addSelectOptionsWithPlaceholder(select, options);
      assert.lengthOf(select.options, 4,
        'addSelectOptionsWithPlaceholder should have added 4 options (data + placeholder)');
      assert.strictEqual(select.options[select.selectedIndex].label, 'select with data',
        'addSelectOptionsWithPlaceholder should have selected the default placeholder option');
    },

    'resetList': function() {
      var ul = domConstruct.create('ul');
      domConstruct.create('li', { innerHTML: 'item 1'});
      domConstruct.create('li', { innerHTML: 'item 2'});
      domConstruct.create('li', { innerHTML: 'item 3'});
      domConstruct.create('li', { innerHTML: 'item 4'});

      DomUtils.resetList(ul);
      assert.lengthOf(ul.children, 0, 'resetList should have removed all list items');
    },

    'mergeArrays with arrays of objects': function() {
      var arr1 = [{id: 1, label: 'item 1'}, {id: 2, label: 'item 2'}, {id: 3, label: 'item 3'}];
      var arr2 = [{id: 1, label: 'item 1'}, {id: 4, label: 'item 4'}, {id: 5, label: 'item 5'}];

      // test with array of objects
      assert.lengthOf(DomUtils.mergeArrays(arr1, arr2, 'id'), 5, 'mergeArrays should return an array with 5 items');
      assert.sameDeepMembers(DomUtils.mergeArrays(arr1, arr2, 'id'), [{id: 1, label: 'item 1'},
          {id: 2, label: 'item 2'}, {id: 3, label: 'item 3'}, {id: 4, label: 'item 4'}, {id: 5, label: 'item 5'}] ,
        'mergeArrays should return a merged array with no duplicate elements');
    },

    'mergeArrays with arrays of integers': function() {
      // test with array of integers (non-objects)
      var arr3 = [1, 2, 3, 4];
      var arr4 = [5, 6, 1, 4];
      assert.lengthOf(DomUtils.mergeArrays(arr3, arr4), 6, 'mergeArrays should return an array with 6 items');
      assert.sameMembers(DomUtils.mergeArrays(arr3, arr4), [1, 2, 3, 4, 5, 6],
        'mergeArrays should return a merged array with no duplicate elements');
    },

    'makeArrayUnique with arrays of objects': function() {
      var arr = [{id: 1, label: 'item 1'}, {id: 2, label: 'item 2'}, {id: 3, label: 'item 3'},
        {id: 1, label: 'item 1'}];

      // test with array of objects
      assert.lengthOf(DomUtils.makeArrayUnique(arr, 'id'), 3, 'makeArrayUnique should return an array with 3 items');
      assert.sameDeepMembers(DomUtils.makeArrayUnique(arr, 'id'), [{id: 1, label: 'item 1'}, {id: 2, label: 'item 2'},
        {id: 3, label: 'item 3'}], 'makeArrayUnique should return an array with unique elements');
    },

    'makeArrayUnique with arrays of integers': function() {
      // test with array of integers (non-objects)
      var arr2 = [1, 2, 3, 4, 1, 3];
      assert.lengthOf(DomUtils.makeArrayUnique(arr2), 4, 'makeArrayUnique should return an array with 4 items');
      assert.sameMembers(DomUtils.makeArrayUnique(arr2), [1, 2, 3, 4],
        'makeArrayUnique should return an array with unique elements');
    }
  });
});