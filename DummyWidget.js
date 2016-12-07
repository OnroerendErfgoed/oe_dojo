define([
  'dojo/_base/declare',
  'dijit/_WidgetBase'
], function (
  declare,
  _WidgetBase
) {
  return declare([_WidgetBase], {
    // description:
    //
    baseClass: 'dummywidget',
    dummyProp: null,

    // Properties to be sent into constructor

    postCreate: function () {
      // summary:
      //      Overrides method of same name in dijit._Widget.
      this.inherited(arguments);
    },

    setData: function (value) {
        this.dummyProp = value;
    },

    getData: function () {
      return this.dummyProp;
    }

  });
});
