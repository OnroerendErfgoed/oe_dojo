define([
  'intern!object',
  'intern/chai!assert',
  'oe_dojo/DateUtils'
], function (
  registerSuite,
  assert,
  DateUtils
) {

  registerSuite({
    name: 'DateUtils',

    'convertIsoStringToDateTime': function() {
      assert.strictEqual(DateUtils.convertIsoStringToDateTime(), null,
        'convertIsoStringToDateTime should return null when no date is given');
      assert.strictEqual(DateUtils.convertIsoStringToDateTime('20161112'), null,
        'convertIsoStringToDateTime should return null when invalid date is given');
      assert.strictEqual(DateUtils.convertIsoStringToDateTime('2016-11-21T13:52:00+01:00'), '21-11-2016 om 13:52',
        'convertIsoStringToDateTime should return a formatted string in readable format');
    },

    'convertIsoStringToDate': function() {
      assert.strictEqual(DateUtils.convertIsoStringToDate(), null,
        'convertIsoStringToDate should return null when no date is given');
      assert.strictEqual(DateUtils.convertIsoStringToDate('20161112'), null,
        'convertIsoStringToDate should return null when invalid date is given');
      assert.strictEqual(DateUtils.convertIsoStringToDate('2016-11-21T13:52+01:00'), '21-11-2016',
        'convertIsoStringToDate should return a formatted string in readable format');
      assert.strictEqual(DateUtils.convertIsoStringToDate('2016-11-21'), '21-11-2016',
        'convertIsoStringToDate should return a formatted string in readable format');
    },

    'serializeDate': function() {
      var testDate = new Date('2016-11-21');
      assert.strictEqual(DateUtils.serializeDate(), null,
        'serializeDate should return null when no date is given');
      assert.strictEqual(DateUtils.serializeDate(testDate), '2016-11-21',
        'serializeDate should return the given date in string format');
    },

    'serializeDateTime': function() {
      var testDate = new Date('2016-11-21');
      testDate.setHours(13, 52);
      assert.strictEqual(DateUtils.serializeDateTime(), null,
        'serializeDateTime should return null when no date is given');
      assert.strictEqual(DateUtils.serializeDateTime(testDate), '2016-11-21T13:52:00+01:00',
        'serializeDateTime should return the given date and time in string format');
    },

    'serializeDateToDdMmYy': function() {
      var testDate = new Date('2016-11-21');
      assert.strictEqual(DateUtils.serializeDateToDdMmYy(), null,
        'serializeDateToDdMmYy should return null when no date is given');
      assert.strictEqual(DateUtils.serializeDateToDdMmYy(testDate), '21-11-2016',
        'serializeDateToDdMmYy should return the given date in string format');
    },

    'parseIsoString': function() {
      var testDate = new Date('2016-11-21');
      testDate.setHours(13, 52);
      assert.strictEqual(DateUtils.parseIsoString(), null,
        'parseIsoString should return null when no date string is given');
      // conversion to getMiliseconds for the assertion of objects
      assert.strictEqual(DateUtils.parseIsoString('2016-11-21T13:52:00+01:00').getMilliseconds(),
        testDate.getMilliseconds(), 'parseIsoString should return the given date as a date object');
    },

    'getTimeZone': function() {
      var winterDate = new Date(Date.parse('18 Dec 2016 00:00:00 GMT+2'));
      var zomerDate = new Date(Date.parse('20 Aug 2016 00:00:00 GMT+2'));

      assert.strictEqual(DateUtils.getTimeZone(winterDate), '+01:00',
        'getTimeZone should return the correct timezone for a date in winter');
      assert.strictEqual(DateUtils.getTimeZone(zomerDate), '+02:00',
        'getTimeZone should return the correct timezone for a date in summer');
    }
  });
});