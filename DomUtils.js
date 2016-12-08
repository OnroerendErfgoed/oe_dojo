/**
 * Module voor het werken met dom elementen
 * @module DomUtils
 */
define([
  'dojo/_base/array',
  'dojo/dom-construct'
], function (
  array,
  domConstruct
) {
  return{
    /**
     * Geeft de geselecteerde 'option' terug uit de 'select'.
     * @param {Object} select De 'select' lijst
     * @returns {String} Value van de  geselecteerde 'option'
     */
    getSelectedOption: function (select) {
      if(select.options[select.selectedIndex]) {
        return select.options[select.selectedIndex].value;
      }
      else { return null; }
    },

    /**
     * Geeft het label van geselecteerde 'option' terug uit de 'select'.
     * @param {Object} select De 'select' lijst
     * @returns {String} Label van de  geselecteerde 'option'
     */
    getSelectedOptionLabel: function (select) {
      return select.options[select.selectedIndex].label;
    },


    /**
     * Zet een of meerdere 'options' geselecteerd voor een 'select' lijst.
     * @param {Object} select De 'select' lijst
     * @param {Array} values De geselecteerde 'option' waardes
     */
    setSelectedOptions: function (select, values) {
      var options = select && select.options;
      for (var i=0, iLen=options.length; i<iLen; i++) {
        options[i].selected = (values.indexOf(options[i].value) > -1);
      }
    },

    /**
     * Verwijder de opties
     * @param select {Object} select De 'select' lijst
     */
    resetSelectOptions: function (select) {
      domConstruct.empty(select);
    },

    /**
     * Voeg 'options' toe aan een 'select' lijst.
     * @param {Object} select De 'select' lijst
     * @param {Object} options Een object met de opties, formaat:
     *   {
     *     data: {array},
     *     idProperty: {string},
     *     labelProperty: {string}
     *   }
     */
    addSelectOptions: function (select, options){
      domConstruct.empty(select);
      array.forEach(options.data, function (item) {
        domConstruct.place(
          '<option value="' + item[options.idProperty] + '">' + item[options.labelProperty] + '</option>', select);
      });
    },

    addSelectOptionsWithPlaceholder: function (select, options){
      var placeholder = options.placeholder || 'Kies een optie...';
      domConstruct.empty(select);
      domConstruct.place(
        '<option value="-1" class="select-placeholder" selected>' + placeholder + '</option>', select);
      array.forEach(options.data, function (item) {
        domConstruct.place(
          '<option value="' + item[options.idProperty] + '">' + item[options.labelProperty] + '</option>', select);
      });
    },

    resetList: function (ullist) {
      domConstruct.empty(ullist);
    },


    /**
     * Utility om arrays van objecten te mergen zonder dubbele entries (aan de hand van een uniek id)
     * @param {array} array1 De eerste array
     * @param {array} array2 De tweede array
     * @param {String} idField De property die het uniek id bevat (default 'id');
     */
    _mergeArrays: function (array1, array2, idField) {
      idField = idField ? idField : 'id';
      var nonUnique = array1.concat(array2);
      var uniqueIds = {};
      return array.filter(nonUnique, function(value) {
        if (!uniqueIds[value[idField]]) {
          uniqueIds[value[idField]] = true;
          return true;
        }
        return false;
      });
    },

    makeArrayUnique: function (nonUniqueArray) {
      var unique = {};

      return array.filter(nonUniqueArray, function(value) {
        if (!unique[value]) {
          unique[value] = true;
          return true;
        }
        return false;

      });
    }
  };
});