define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin'
], function (
  declare,
  _WidgetBase,
  _TemplatedMixin
) {
  return declare([_WidgetBase, _TemplatedMixin], {

    baseClass: 'dummywidget',

    dummyProp: null,

    templateString: '<div><h2 data-dojo-attach-point="dataNode">title2</h2></div>',

    postCreate: function () {
      this.inherited(arguments);
    },

    setData: function (value) {
      this.dummyProp = value;
      this.dataNode.innerHtml = value;
    },

    getData: function () {
      return this.dummyProp;
    }

  });
});
