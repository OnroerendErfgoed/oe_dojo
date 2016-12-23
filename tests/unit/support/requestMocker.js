define([
  'dojo/request/registry',
  'dojo/when'
], function (
  registry,
  when
) {

  var mocking = false,
    handles = [];

  function start() {
    if (mocking) {
      return;
    }
    mocking = true;
    // Set up a handler for requests that mock a
    // response without requesting from the server at all

    //foobar
    handles.push(
      registry.register(/^foobar$/, function (url, options) {
        console.debug('requestMocker::foobar', url, options);
        return when({
          foo: 'bar'
        });
      })
    );

    //401 error
    handles.push(
      registry.register(/^401/, function (url, options) {
        console.debug('requestMocker::401', url, options);
        // Wrap using `when` to return a promise;
        // you could also delay the response
        var response = {
          'status': 401
        };
        return response
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
    stop: stop,
    handles: handles
  };
});
