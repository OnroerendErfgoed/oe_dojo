define([
  'intern!object',
  'intern/chai!assert',
  'dojo/request',
  '../support/requestMocker',
  'oe_dojo/HandlerUtils'
], function (
  registerSuite,
  assert,
  request,
  requestMocker,
  HandlerUtils
) {

  registerSuite({
    name: 'HandlerUtils',

    setup: function() {
      requestMocker.start();
    },

    teardown: function() {
      requestMocker.stop();
    },

    'GET returning 401': function() {
      request('/info').then(function(data) {
        console.log(data);
      });
    }
  });
});