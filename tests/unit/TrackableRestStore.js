define([
  'intern!object',
  'intern/chai!assert',
  'oe_dojo/TrackableRestStore'
], function (
  registerSuite,
  assert,
  TrackableRestStore
) {

  var trStore;

  registerSuite({
    name: 'TrackableRestStore',

    setup: function() {
      trStore = new TrackableRestStore({data: []});
    },

    'trackable store': function() {
      assert.isFunction(trStore.track, 'TrackableRestStore should have a track() function');
    },

    'rest store': function() {
      assert.isFunction(trStore.get, 'TrackableRestStore should have a get() function');
      assert.isFunction(trStore.add, 'TrackableRestStore should have a add() function');
      assert.isFunction(trStore.remove, 'TrackableRestStore should have a remove() function');
      assert.isFunction(trStore.put, 'TrackableRestStore should have a put() function');
    }
  });
});