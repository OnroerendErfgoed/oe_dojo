define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/dom-construct',
  'dojo/dom-attr',
  'dojo/on'
], function(
  declare,
  lang,
  domConstruct,
  domAttr,
  on
){
  return declare(null, {

    copyType: null,
    clipBoard: {},
    _copyButton: null,
    _pasteButton: null,

    postCreate: function() {
      this.inherited(arguments);
      this._doLayout();
    },

    startup: function() {
      this.inherited(arguments);
    },

    enable: function() {
      this.inherited(arguments);
      domAttr.remove(this._copyButton, 'disabled');
      domAttr.remove(this._pasteButton, 'disabled');
    },

    disable: function() {
      this.inherited(arguments);
      domAttr.set(this._copyButton, 'disabled', true);
      domAttr.set(this._pasteButton, 'disabled', true);
    },

    copy: function(type) {
      try {
        this.clipBoard[type] = this.getData();
      } catch (e) {
        console.error(e);
        throw new TypeError('Geen getData beschikbaar voor copy in de widget');
      }
    },

    paste: function(type) {
      try {
        this.setData(this.clipBoard[type]);
      } catch (e) {
        console.error(e);
        throw new TypeError('Geen setData beschikbaar voor copy in de widget');
      }
    },

    _doLayout: function() {
      this._copyButton = domConstruct.create('button', { 'class': 'clipBoardButton copyButton button tiny',
        innerHTML: '<i class="fa fa-copy"></i>', title: 'Kopiëren'}, this.domNode, 'first');
      on(this._copyButton, 'click', lang.hitch(this, function() {
        this.copy(this.copyType);
      }));

      this._pasteButton = domConstruct.create('button', { 'class': 'clipBoardButton pasteButton button tiny',
        innerHTML: '<i class="fa fa-paste"></i>', title: 'Plakken', style: 'margin-left: 5px;'}, this.domNode, 'first');
      on(this._pasteButton, 'click', lang.hitch(this, function() {
        this.paste(this.copyType);
      }));
    }
  });
});