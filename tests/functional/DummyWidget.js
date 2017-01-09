define([
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/dojo/node!dijit-intern-helper/helpers/dijit',
  'intern/dojo/node!leadfoot/helpers/pollUntil'
], function (
  registerSuite,
  assert,
  require,
  dijit,
  pollUntil
) {

  registerSuite({
    name: 'DummyWidget',

    'html load test': function () {
      return this.remote
        .get(require.toUrl('tests/functional/DummyWidget.html'))
        .setFindTimeout(10000)
        .setPageLoadTimeout(8000)
        .setExecuteAsyncTimeout(10000)
        .then(pollUntil('return document.getElementById("testid");', 5000))
        .then(function(){
          return true;
        });
    },

    'widget load test': function () {
      return this.remote
        .get(require.toUrl('tests/functional/DummyWidget.html'))
        .setFindTimeout(4000)
        .setPageLoadTimeout(4000)
        .setExecuteAsyncTimeout(4000)
        .then(pollUntil('return document.getElementById("testid");', 5000))
        // Obtain widget DOM node via the dijit registry
        .then(dijit.byId('widgetNode'))
        .then(function (/*widget*/) {
          return true;
          //assert.isFunction(widget.getData, 'widget.getData is a function');
          //return widget.get('a');
        });
        //.then(function(prop) {
        //  assert.strictEqual(prop, null);
        //});
    }
  });
});