/**
 * utils Module voor het behandelen van ajax responses
 * @module HandlerUtil
 */
define([
  'dojo/request/handlers',
  'dojo/json'
], function (
  handlers,
  JSON
) {
  handlers.register('customJson', function(response){
    if (response.status === 401) {
      throw {
        title: 'Niet bevoegd',
        message: 'U hebt niet voldoende rechten om deze data op te halen: ' + response.url
      };
    }
    else if (response.status === 404) {
      throw {
        title: 'Niet gevonden',
        message: 'De opgevraagde resource werd niet gevonden: ' + response.url
      };
    }
    else {
      return JSON.parse(response.text || null);
    }
  });
});