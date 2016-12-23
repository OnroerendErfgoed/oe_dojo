/**
 * utils Module voor het behandelen van ajax responses
 * @module HandlerUtils
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
      console.debug('HandlerUtil::customJson::401', response);
      throw {
        title: 'Niet bevoegd',
        message: 'U hebt niet voldoende rechten om deze data op te halen: ' + response.url
      };
    }
    else if (response.status === 404) {
      console.debug('HandlerUtil::customJson::404', response);
      throw {
        title: 'Niet gevonden',
        message: 'De opgevraagde resource werd niet gevonden: ' + response.url
      };
    }
    else {
      console.debug('HandlerUtil::customJson::else', response);
      return JSON.parse(response.text || '{}');
    }
  });
});