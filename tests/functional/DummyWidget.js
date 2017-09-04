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
      var url = require.toUrl('tests/functional/DummyWidget.html');

      return this.remote
        .get(require.toUrl(url))
        .setFindTimeout(4000)
        .setPageLoadTimeout(4000)
        .setExecuteAsyncTimeout(4000)
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
        .findByTagName('h2')
        .getVisibleText()
        .then(function (text) {
          assert.strictEqual(text, 'title2');
        });
    }
  });
});