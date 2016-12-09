define([
  'intern!object',
  'intern/chai!assert',
  'oe_dojo/TrackableMemoryStore'
], function (
  registerSuite,
  assert,
  TrackableMemoryStore
) {

  var tmStore;

  registerSuite({
    name: 'TrackableMemoryStore',

    setup: function() {
      tmStore = new TrackableMemoryStore({data: []});
    },

    'trackable store': function() {
      assert.isFunction(tmStore.track, 'TrackableMemoryStore should have a track() function');
    },

    'memory store': function() {
      assert.isFunction(tmStore.getSync, 'TrackableMemoryStore should have a get() function');
      assert.isFunction(tmStore.addSync, 'TrackableMemoryStore should have a add() function');
      assert.isFunction(tmStore.removeSync, 'TrackableMemoryStore should have a remove() function');
      assert.isFunction(tmStore.putSync, 'TrackableMemoryStore should have a put() function');
    }
  });
});