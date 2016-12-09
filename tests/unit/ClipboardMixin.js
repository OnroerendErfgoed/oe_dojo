define([
  'intern!object',
  'intern/chai!assert',
  'dojo/_base/declare',
  'dojo/dom-construct',
  'oe_dojo/ClipboardMixin',
  'oe_dojo/DummyWidget'
], function (
  registerSuite,
  assert,
  declare,
  domContruct,
  clipboardMixin,
  DummyWidget
) {

  var clip1, clip2, clip3, clip4;

  registerSuite({
    name: 'ClipboardMixin',

    beforeEach: function() {
      var DummyWidgetCopy = declare([DummyWidget, clipboardMixin]);

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
    }
  });
});