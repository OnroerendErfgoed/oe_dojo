define([
  'intern!object',
  'intern/chai!assert',
	'intern/dojo/node!../../../Command',
	'intern/dojo/node!../../../helpers/dijit',
	'leadfoot/tests/functional/support/util',
	'require'
], function (registerSuite, assert, Command, remoteRegistry, util, require) {

  registerSuite({
    name: 'test 1',
    'successful test 1': function () {
      return this.remote
        .get(require.toUrl('DummyWidget.html'))
        .setFindTimeout(10000)
        .setPageLoadTimeout(8000)
        .setExecuteAsyncTimeout(10000)
        .then(function(){
          return true;
        });
    }
  });
});