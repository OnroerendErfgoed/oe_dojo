define([
  'intern!object',
  'intern/chai!assert',
  'dojo/request',
  'oe_dojo/HandlerUtils',
  './support/requestMocker'
], function (
  registerSuite,
  assert,
  request,
  HandlerUtils,
  requestMocker

) {

  registerSuite({
    name: 'HandlerUtils',

    setup: function() {
      requestMocker.start();
    },

    teardown: function() {
      requestMocker.stop();
    },

    'requestMocker basic test': function() {
      var dfd = this.async();

      request.get('foobar', {
        handleAs: 'json'
      }).then(function(data){
        try {
          assert.deepEqual(data, {
            foo: {
              name: 'bar'
            }
          });
          dfd.resolve();
        }
        catch (err) {
          dfd.reject(err);
        }
      }, function(err){
        dfd.reject(err);
      });
    },

    'HandlerUtils customJson default': function() {
      var dfd = this.async();

      request.get('foobar', {
        handleAs: 'customJson'
      }).then(function(data){
        try {
          assert.deepEqual(data, {
            foo: {
              name: 'bar'
            }
          });
          dfd.resolve();
        }
        catch (err) {
          dfd.reject(err);
        }
      }, function(err){
        dfd.reject(err);
      });
    },

    'HandlerUtils customJson default empty response': function() {
      var dfd = this.async();

      request.get('empty', {
        handleAs: 'customJson'
      }).then(function(data){
        try {
          assert.deepEqual(data, {});
          dfd.resolve();
        }
        catch (err) {
          dfd.reject(err);
        }
      }, function(err){
        dfd.reject(err);
      });
    },

    'HandlerUtils customJson 404': function() {
      var dfd = this.async();

      request.get('unknownurl', {
        handleAs: 'customJson'
      }).then(function(){
        dfd.reject('unknownurl test should fail');
      }, function(err){
        try {
          // assert.strictEqual(err.title, 'Niet gevonden', 'Error title for 404 should be fixed');
          assert.strictEqual(err.response.status, 404, 'Error title for 404 should be fixed');
          dfd.resolve();
        }
        catch (assertError) {
          dfd.reject(assertError);
        }
      });
    }

  });
});