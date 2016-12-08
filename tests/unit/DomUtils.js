define([
  'intern!object',
  'intern/chai!assert',
  'oe_dojo/DomUtils',
  'dojo/dom-construct'
], function (
  registerSuite,
  assert,
  DomUtils,
  domConstruct
) {

  registerSuite({
    name: 'DomUtils',

    'getSelectedOption': function() {
      // init select without selected option
      var select = domConstruct.create('select');
      domConstruct.create('option', { value: 1, innerHTML: 'option 1'}, select);
      domConstruct.create('option', { value: 2, innerHTML: 'option 2'}, select);
      domConstruct.create('option', { value: 3, innerHTML: 'option 3'}, select);

      assert.strictEqual(DomUtils.getSelectedOption(select), '1',
        'getSelectedOption should return first option when nothing selected');

      // add selected option to select
      domConstruct.create('option', { value: 4, innerHTML: 'option 4', selected: 'selected'}, select);

      assert.strictEqual(DomUtils.getSelectedOption(select), '4',
        'getSelectedOption should return the value of the selected option');
    },

    'getSelectedOptionLabel': function() {
       // init select without selected option
      var select = domConstruct.create('select');
      domConstruct.create('option', { value: 1, innerHTML: 'option 1'}, select);
      domConstruct.create('option', { value: 2, innerHTML: 'option 2'}, select);
      domConstruct.create('option', { value: 3, innerHTML: 'option 3'}, select);

      assert.strictEqual(DomUtils.getSelectedOptionLabel(select), 'option 1',
        'getSelectedOption should return label of first option when nothing selected');

      // add selected option to select
      domConstruct.create('option', { value: 4, innerHTML: 'option 4', selected: 'selected'}, select);

      assert.strictEqual(DomUtils.getSelectedOptionLabel(select), 'option 4',
        'getSelectedOption should return the label of the selected option');
    },
    
    'setSelectedOptions': function () {
       var select = domConstruct.create('select');
      domConstruct.create('option', { value: 1, innerHTML: 'option 1'}, select);
      domConstruct.create('option', { value: 2, innerHTML: 'option 2'}, select);
      domConstruct.create('option', { value: 3, innerHTML: 'option 3'}, select);
      // set option 2 selected
      DomUtils.setSelectedOptions(select, ['2']);

      assert.strictEqual(select.options[select.selectedIndex].value, '2',
        'setSelectedOptions should have selected the correct options');
    }
  });
});