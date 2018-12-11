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
    else if (response.status >= 500 && response.status < 600) {
      throw {
        title: 'Er is een fout opgetreden (' + response.status + ')',
        message: 'Er ging iets fout in de server. Onze excuses. Stel je fouten vast of heb je een vraag? ' +
            'Mail dan naar <a href="mailto:ict@onroerenderfgoed.be">ict@onroerenderfgoed.be</a>'
      };
    }
    else {
      return JSON.parse(response.text || '{}');
    }
  });
});