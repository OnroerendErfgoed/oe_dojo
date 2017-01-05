/**
 * Voegt twee methodes toe aan de standaard dijit.filteringSelect: _startSearch waardoor begonnen wordt met zoeken
 * indien 2 letters ingegeven zijn en _onKey die de dropdown met mogelijkheden sluit indien de enter key ingedrukt
 * wordt.
 */
define([
  'dojo/_base/declare',
  'dojo/keys',
  'dojo/dom-class',
  'dijit/form/FilteringSelect'
], function (
  declare,
  keys,
  domClass,
  FilteringSelect
) {
  return declare([FilteringSelect], {

    minKeyCount: 2,

    _startSearch: function (/*String*/key) {
      // summary:
      //		Putting minimum characters
      // overrides: _SearchMixin
      if (!key || key.length < this.minKeyCount) {
        this.closeDropDown();
        return false;
      }
      this.inherited(arguments);
      domClass.add(this.dropDown.domNode, 'fancy');

      return true;
    },

    _onKey: function (/*Event*/ evt) {
      // summary:
      //		Handles keyboard events
      // overrides: _AutoCompleterMixin
      var key = evt.charCode || evt.keyCode;
      if (key === keys.ENTER) {
        this.closeDropDown();
        this.emit('key.enter', {selection: this.get('value')});
        return;
      }
      this.inherited(arguments);
    }
  });
});