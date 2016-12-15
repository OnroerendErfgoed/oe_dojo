define([
  'dojo/request/registry',
  'dojo/request/script',
  'dojo/when'
], function (registry, script) {
  var mocking = false,
    handles = [];

  function start() {
    if (mocking) {
      return;
    }
    mocking = true;
    // Set up a handler for requests to '/info' that mocks a
    // response without requesting from the server at all

    registry.register(/\.jsonp\.js$/i, script);

    registry.register('/info', script);

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
