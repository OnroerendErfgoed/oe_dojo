define([
  'dojo/request/registry',
  'dojo/when'
], function (registry, when) {
  var mocking = false,
    handles = [];

  function start() {
    if (mocking) {
      return;
    }
    mocking = true;
    // Set up a handler for requests to '/info' that mocks a
    // response without requesting from the server at all
    handles.push(
      registry.register('/info', function (url, options) {
        // Wrap using `when` to return a promise;
        // you could also delay the response
        return when('test');
      })
    );
  }

  function stop() {
    if (!mocking) {
      return;
    }
    mocking = false;
    var handle;
    while ((handle = handles.pop())) {
      handle.remove();
    }
  }

  return {
    start: start,
    stop: stop
  };
});
