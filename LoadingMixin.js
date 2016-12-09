define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/fx',
  'dojo/dom-style',
  'dojo/dom-construct',
  'dojo/topic',
  'dojo/query'
], function(
  declare,
  lang,
  fx,
  domStyle,
  domConstruct,
  topic,
  query
){
  return declare(null, {

    loadingContainer: null,

    /**
     * Naar events luisteren om de loading overlay te tonen/verbergen
     * @public
     */
    registerLoadingEvents: function () {
      topic.subscribe('standby.show',lang.hitch(this, function(evt){
        this.showLoading(evt.message);
      }));
      topic.subscribe('standby.stop',lang.hitch(this, function(){
        this.hideLoading();
      }));
      topic.subscribe('clear.dgrowl', lang.hitch(this, function() {
        this._clearDgrowlMessages();
      }));
    },

    /**
     * Verbergt de 'Loading'-overlay.
     * @public
     */
    hideLoading: function () {
      var node = this.loadingContainer;
      fx.fadeOut({
        node: node,
        onEnd: function (node) {
          domStyle.set(node, 'display', 'none');
        },
        duration: 1000
      }).play();
    },

    /**
     * Toont de 'Loading'-overlay.
     * @public
     */
    showLoading: function (message) {
      console.debug('mixin::showloading', message, this.loadingContainer);
      if (!message) {
        message = '';
      }
      query('.loadingMessage', this.loadingContainer).forEach(function(node){
        node.innerHTML = message;
      });

      domStyle.set(this.loadingContainer, 'display', 'block');
      fx.fadeIn({
        node: this.loadingContainer,
        duration: 1
      }).play();

      topic.publish('clear.dgrowl');
    },

    /**
     * Verbergt al de dgrowl notifications
     * @private
     */
    _clearDgrowlMessages: function() {
      query('.dGrowl-notification').forEach(function (item) {
        domConstruct.destroy(item);
      }, this);
    }
  });
});
