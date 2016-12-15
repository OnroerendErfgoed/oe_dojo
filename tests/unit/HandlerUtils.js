define([
  'intern!object',
  'intern/chai!assert',
  'dojo/request',
  '../support/requestMocker',
  'oe_dojo/HandlerUtils',
  'dojo/request/registry',
  'dojo/request/script',
  'dojo/when'
], function (
  registerSuite,
  assert,
  request,
  requestMocker,
  HandlerUtils,
  registry,
  script,
  when
) {

  registerSuite({
    name: 'HandlerUtils',

    setup: function() {
      console.log('test mocker');
      requestMocker.start();
    },

    'GET returning 401': function() {
      /*var mocker = registry.register('/info', function (url, options) {
       // Wrap using `when` to return a promise;
       // you could also delay the response
       return when('test');
       });*/
      /*var dfd = this.async(1000);

      request.get(
        'helloworld.json', {handleAs: 'json'},
        dfd.callback(function (error, data) {
          if (error) {
            throw error;
          }

          assert.strictEqual(data, 'Hello world!');
        })
      );*/

      request.get("hellowworld.json", {
        handleAs: "json"
      }).then(function(data){
        console.log('succes', data);
      },
        function(err){
          console.log(err);
      });

      request.get("/info", {handleAs: "customJson"}).then(
        function(data) {
          console.log('succes', data);
        },
        function(err){
          console.log(err)
        }
      )
    },

    teardown: function() {
      requestMocker.stop();
    }
  });
});