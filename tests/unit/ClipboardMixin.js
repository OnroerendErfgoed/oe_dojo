define([
  'intern!object',
  'intern/chai!assert',
  'dojo/_base/declare',
  'dojo/dom-construct',
  'dojo/dom-attr',
  'dijit/_WidgetBase',
  'oe_dojo/ClipboardMixin',
  'oe_dojo/DummyWidget'
], function (
  registerSuite,
  assert,
  declare,
  domContruct,
  domAttr,
  _WidgetBase,
  clipboardMixin,
  DummyWidget
) {

  var clip1, clip2, clip3, clip4, faultyClip;

  registerSuite({
    name: 'ClipboardMixin',

    beforeEach: function() {
      var DummyWidgetCopy = declare([DummyWidget, clipboardMixin]);
      var FaultyWidgetCopy = declare([_WidgetBase, clipboardMixin]);

      clip1 = new DummyWidgetCopy({
        copyType: 'test'
      }, domContruct.create('div'));

      clip2 = new DummyWidgetCopy({
        copyType: 'test'
      }, domContruct.create('div'));

      clip3 = new DummyWidgetCopy({
        copyType: 'testtest'
      }, domContruct.create('div'));

      clip4 = new DummyWidgetCopy({
        copyType: 'testtest'
      }, domContruct.create('div'));

      faultyClip = new FaultyWidgetCopy({
        copyType: 'test'
      }, domContruct.create('div'));

    },

    afterEach: function() {
      clip1.destroyRecursive();
      clip2.destroyRecursive();
      clip3.destroyRecursive();
      clip4.destroyRecursive();
    },

    'clipboardMixin copy': function() {
      clip1.setData('joske');
      clip1.copy(clip1.copyType);

      assert.strictEqual(clip1.clipBoard.test, 'joske',
        'clipboardMixin should have copied the value into clipboard array');
    },

    'clipboardMixin copy and paste': function() {
      clip1.setData('joske');
      clip1.copy(clip1.copyType);
      clip2.paste(clip2.copyType);

      assert.strictEqual(clip2.getData(), 'joske',
        'clipboardMixin should have pasted the value into data');
    },

    'clipboardMixin extended copy and paste': function() {
      clip1.setData('joske');
      clip2.setData('jefke');
      clip3.setData('louis');
      clip4.setData('maarten');

      clip1.copy(clip1.copyType);

      assert.strictEqual(clip2.getData(), 'jefke',
        'clipboardMixin should not have changed anything');

      clip2.paste(clip2.copyType);
      assert.strictEqual(clip2.getData(), 'joske',
        'clipboardMixin should have pasted the value into data');

      clip3.paste(clip3.copyType);
      assert.strictEqual(clip3.getData(), undefined,
        'clipboardMixin should have reset the value to undefined because of unknown copytype');

      clip1.copy(clip1.copyType);
      clip4.copy(clip4.copyType);
      clip3.paste(clip3.copyType);
      assert.strictEqual(clip3.getData(), 'maarten',
        'clipboardMixin should have set the data for the given copytype');
    },

    'clipboardMixin disable': function() {
      clip1.enable();
      assert.isFalse(domAttr.has(clip1._copyButton, 'disabled'), '');
      assert.isFalse(domAttr.has(clip1._pasteButton, 'disabled'), '');
      clip1.disable();
      assert.isTrue(domAttr.has(clip1._copyButton, 'disabled'), '');
      assert.isTrue(domAttr.has(clip1._pasteButton, 'disabled'), '');
    },

    'clipboardMixin enable': function() {
      clip1.disable();
      assert.isTrue(domAttr.has(clip1._copyButton, 'disabled'), '');
      assert.isTrue(domAttr.has(clip1._pasteButton, 'disabled'), '');
      clip1.enable();
      assert.isFalse(domAttr.has(clip1._copyButton, 'disabled'), '');
      assert.isFalse(domAttr.has(clip1._pasteButton, 'disabled'), '');

    },

    'clipboardMixin paste wrong type': function() {
      clip1.setData('joske');
      clip1.copy(clip1.copyType);
      clip2.paste('foo');

      assert.strictEqual(clip2.getData(), undefined,
        'clipboardMixin should have pasted undefined for unknown copy type');
    },

    'clipboardMixin no getdata': function() {
      assert.isNotFunction(faultyClip.getdata, 'getdata should not be a function in faultyClip');
      assert.throws(function(){
        faultyClip.copy('bar');
      }, TypeError, 'Geen getData beschikbaar voor copy in de widget');
    },

    'clipboardMixin no setdata': function() {
      assert.isNotFunction(faultyClip.setdata, 'setdata should not be a function in faultyClip');
      assert.throws(function(){
        faultyClip.paste('bar');
      }, TypeError, 'Geen setData beschikbaar voor copy in de widget');
    }
  });
});