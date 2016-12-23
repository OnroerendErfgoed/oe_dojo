define([
  'dojo/request/registry',
  'dojo/when',
  'dojo/request/xhr'
], function (
  registry,
  when,
  xhr
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
        return xhr(require.toUrl('../../tests/unit/support/data/foobar.json'), options);
      })
    );

    //empty json
    handles.push(
      registry.register(/^empty/, function (url, options) {
        console.debug('requestMocker::empty', url, options);
        return xhr(require.toUrl('../../tests/unit/support/data/empty.json'), options);
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
