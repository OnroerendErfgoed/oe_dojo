define([
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/dojo/node!dijit-intern-helper/helpers/dijit',
  'intern/dojo/node!leadfoot/helpers/pollUntil',
  'intern/dojo/node!leadfoot/keys'
], function (
  registerSuite,
  assert,
  require,
  dijit,
  pollUntil,
  keys
) {

  registerSuite({
    name: 'EnhancedFilteringSelect',

    'html load test': function () {
      var url = require.toUrl('tests/functional/EnhancedFilteringSelect.html');

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

    'dropdown open test with input "test"': function () {
      return this.remote
        .get(require.toUrl('tests/functional/EnhancedFilteringSelect.html'))
        .setFindTimeout(4000)
        .setPageLoadTimeout(4000)
        .setExecuteAsyncTimeout(4000)
        .then(pollUntil('return document.getElementById("testid");', 5000))
        .then(dijit.nodeById('widgetNode', 'focusNode'))
          .click()
          .type('test')
          .end()
        .findAllByClassName('dijitComboBoxMenu')
          .findAllByCssSelector('.dijitMenuItem.dijitReset')
            .getVisibleText()
            .then(function (texts) {
              assert.deepEqual(texts, [
                'test1',
                'test2'
              ], 'The filtering select dropdown list should contain all values with test in the name');
            });
    }
  });
});