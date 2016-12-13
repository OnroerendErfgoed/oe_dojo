define([
  'intern!object',
  'intern/chai!assert',
  'oe_dojo/ErrorUtils'
], function (
  registerSuite,
  assert,
  ErrorUtils
) {

  registerSuite({
    name: 'ErrorUtils',

    'parseError msg and title error': function() {
      var errorMsgTitle = {title: 'Incorrecte Token', message: 'Het aangeboden SSO token is niet geldig'};
      // msg and title error
      assert.deepEqual(ErrorUtils.parseError(errorMsgTitle), errorMsgTitle,
        'parseError should return the given error with message and title');
    },

    'parseError unformatted error': function() {
      var errorNoFormat = 'Het aangeboden SSO token is ongeldig';
      // unformatted error (string)
      assert.deepEqual(ErrorUtils.parseError(errorNoFormat),
        {message: 'Het aangeboden SSO token is ongeldig', title: 'Er is een fout opgetreden'},
        'parseError should return the given unformatted error as message of the returned error object');
    },

    'parseError formatted error': function() {
      var errorFormatted = {
        response: {
          text: '{"message": "Het aangeboden SSO token is incorrect", "errors": ["error 1", "error 2"]}'
        }
      };
      // correctly formatted error
      assert.deepEqual(ErrorUtils.parseError(errorFormatted),
        {title: 'Het aangeboden SSO token is incorrect', message: '-error 1</br>-error 2</br>'},
        'parseError should return the parsed and formatted error');
    }
  });
});