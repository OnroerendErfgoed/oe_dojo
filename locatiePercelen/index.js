/**
 * Main module. Start de App module op.
 * @module main
 * @see module:App
 */

define([
  './index',
  'dojo/dom',
  'dojo/_base/config',
  'dojo/domReady!'
], function (
  App,
  dom,
  config
) {
  /**
   * Maakt een nieuwe App module aan en start deze.
   * @see module:App
   */
  var appConfig = config.appConfig;
  appConfig.appContainer = dom.byId('appLayout');
  appConfig.loadingContainer = dom.byId('loadingOverlay');

    return new App({
      appConfig: appConfig
    }).startup();
});

/**
 * Main application widget.
 * Deze widget staat in voor het instantieeren van de globale layout
 * van de applicatie.
 * Het doel van deze widget is om zo generiek mogelijk te zijn.
 * @module App
 * @see module:App
 */
define([
  'dijit/_WidgetBase',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/promise/all',
  './controllers/AuthorisationController',
  'dGrowl'
], function (
  WidgetBase,
  declare,
  lang,
  all,
  NotaUi,
  ArcheologienotaUi,
  AuthorisationController
) {
  return declare([WidgetBase], {

    appConfig: null,
    _controllers: null,

    /**
     * Standaard widget functie.
     * @public
     */
    postCreate: function () {
      this.inherited(arguments);
      this._controllers = {};

      this._controllers.authorisationController = new AuthorisationController({
        baseUrl: this.appConfig.baseUrl,
        application: this.appConfig.application
      });

    },

    /**
     * Start de UiController op.
     * @public
     */
    startup: function () {
      this.inherited(arguments);
      console.debug('App::startup', this.appConfig);


  });
});
