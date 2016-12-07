/**
 * Module voor het werken met datums.
 * @module DateUtils
 */
define([
  'dojo/date/stamp',
  'dojo/date/locale'
], function (
  stamp,
  locale
) {
  return {
    /**
     * Zet een datum string om in een datum object met tijdsaanduiding.
     * @param {string} date Datum string in ISO formaat
     * @returns {Date|String} Het omgezette datum object
     */
    convertIsoStringToDateTime: function (date) {
      if (!date) {
        return ' - ';
      }
      var d = stamp.fromISOString(date);
      if (d) {
        return locale.format(d, {
          datePattern: 'dd-MM-yyyy',
          timePattern: '\'om \'HH:mm'
        });
      }
      else
      {
        return ' - ';
      }
    },

    /**
     * Zet een datum string om in een datum object.
     * @param {string} date Datum string in ISO formaat
     * @returns {Date|String} Het omgezette datum object
     */
    convertIsoStringToDate: function (date) {
      if (!date) {
        return ' - ';
      }
      var d = stamp.fromISOString(date);
      if (d) {
        return locale.format(d, {
          selector: 'date',
          datePattern: 'dd-MM-yyyy'
        });
      }
      else
      {
        return ' - ';
      }
    },

    /**
     * Zet een datum object om in een datum string.
     * @param {Date} dateObject
     * @returns {string} Datum string
     */
    serializeDate: function(dateObject){
      if (!dateObject) {
        return null;
      }

      var format =  {
        selector: 'date',
        datePattern: 'yyyy-MM-dd'
      };
      return locale.format(dateObject, format).toUpperCase();
    },

    /**
     * Zet een datum object om in een datum string met datum, tijd en timezone
     * @param {Date} dateObject
     * @returns {string} Datum string
     */
    serializeDateTime: function(dateObject){
      if (!dateObject) {
        return null;
      }
      var timeZone = this.getTimeZone();
      var format =  {
        datePattern: 'yyyy-MM-dd',
        timePattern: '\'T\'HH:mm:ss' + timeZone
      };
      return locale.format(dateObject, format).toUpperCase().replace(/\s+/g, '');
    },

    /**
     * Zet een datum object om in een datum string van het formaat dd-mm-yyyy.
     * @param {Date} dateObject
     * @returns {string|null} Datum string
     */
    serializeDateToDdMmYy: function (dateObject) {
      if (!dateObject) {
        return null;
      }

      var format = {
        selector: 'date',
        datePattern: 'dd-MM-yyyy'
      };
      return locale.format(dateObject, format);
    },

    /**
     * Zet een datum string om in een datum object.
     * @param {String} date Datum string in ISO formaat
     * @returns {Date} Het datum object
     */
    parseIsoString: function (date) {
      if (!date) {
        return null;
      }
      return stamp.fromISOString(date);
    },

    /**
     * Berekend de huidige timezone offset
     * @returns {number} de timezone offset (vb formaat: +01:00 / -12:00 / -03:00)
     */
    getTimeZone: function() {
      var offset = new Date().getTimezoneOffset();
      var positive = false;
      if (offset < 0) {
        positive = true;
      }
      offset = Math.abs(offset / 60);
      var strOffset = offset;
      if (offset < 10) {
        strOffset = '0' + offset.toString() + ':00';
      } else {
        strOffset = offset.toString() + ':00';
      }
      if (positive) {
        strOffset = '+' + strOffset;
      } else {
        strOffset = '-' + strOffset;
      }

      return strOffset;
    }
  };
});