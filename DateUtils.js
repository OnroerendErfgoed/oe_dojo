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
        return null;
      }
      var d = stamp.fromISOString(date);
      if (d) {
        return locale.format(d, {
          datePattern: 'dd-MM-yyyy',
          timePattern: '\'om \'HH:mm',
          locale: 'be'
        });
      } else {
        return null;
      }
    },

    /**
     * Zet een datum string om in een datum object.
     * @param {string} date Datum string in ISO formaat
     * @returns {Date|String} Het omgezette datum object
     */
    convertIsoStringToDate: function (date) {
      if (!date) {
        return null;
      }
      var d = stamp.fromISOString(date);
      if (d) {
        return locale.format(d, {
          selector: 'date',
          datePattern: 'dd-MM-yyyy',
          locale: 'be'
        });
      } else {
        return null;
      }
    },

    /**
     * Zet een datum object om in een datum string.
     * @param {Date} dateObjectd
     * @returns {string} Datum string
     */
    serializeDate: function(dateObject){
      if (!dateObject) {
        return null;
      }

      var format =  {
        selector: 'date',
        datePattern: 'yyyy-MM-dd',
        locale: 'be'
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
      var timeZone = this.getTimeZone(dateObject);
      var format =  {
        datePattern: 'yyyy-MM-dd',
        timePattern: '\'T\'HH:mm:ss' + timeZone,
        locale: 'be'
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
        datePattern: 'dd-MM-yyyy',
        locale: 'be'
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
     * Berekend de timezone offset van het meegegeven date object
     * @param {Date} dateObject Date object
     * @returns {number} de timezone offset (vb formaat: +01:00 / -12:00 / -03:00)
     */
    getTimeZone: function(dateObject) {
      var offset = dateObject.getTimezoneOffset();
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