define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/topic',
  'dojo/on',
  'dojo/query',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/dom-attr',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/Dialog',
  'dojo/text!./templates/RefAdresDialog.html',
  '../TrackableMemoryStore',
  '../EnhancedFilteringSelect',
  'dojo/NodeList-manipulate'
], function (
  declare,
  lang,
  array,
  topic,
  on,
  query,
  domClass,
  domConstruct,
  domAttr,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  Dialog,
  template,
  TrackableMemoryStore,
  EnhancedFilteringSelect
) {
  return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'refadres-dialog',
    title: 'Wijzig referentie adres',
    locatieService: null,
    refAdresType: null,
    _adresStore: null,
    _manueelAdresSelect: null,
    _manueelAdres: null,
    _dichtstbijzijndeAdres: null,

    postCreate: function () {
      this.inherited(arguments);

      this._adresStore = new TrackableMemoryStore({ data: [], idProperty: 'id' });

      var manueelAdresStore = this.locatieService.getGeolocationStore();
      // filteringselect voor vrij adres input
      this._manueelAdresSelect = new EnhancedFilteringSelect({
        store: manueelAdresStore,
        disabled: true,
        name: 'manueelAdres',
        placeholder: 'Geef een adres in..',
        searchAttr: 'locatie',
        labelAttr: 'id',
        hasDownArrow: false,
        required: false,
        'class': 'placeholder-input',
        style: 'width: 63%;',
        onChange: lang.hitch(this, function (val) {
          if (val === '') {
            this._manueelAdres = null;
          }
          else {
            manueelAdresStore.get(val).then(lang.hitch(this, function (data) {
              if (data && data.locatie && data.type) {
                this._manueelAdres = this._parseAddressString(data.locatie);
              } else {
                this._manueelAdres = null;
              }
            }));
          }
        })
      }, this.vrijAdresNode);

      // checkbox events
      this.own(
        on(this.perceelAdresCheckbox, 'change', lang.hitch(this, function() {
          if (this.perceelAdresCheckbox.checked) {
            this.dichtstbijzijndeAdresCheckbox.checked = false;
            this.vrijAdresCheckbox.checked = false;

            this._manueelAdresSelect.reset();
            this._manueelAdresSelect.set('disabled', true);
            domAttr.remove(this.perceelAdresSelectNode, 'disabled');
          }
          else {
            domAttr.set(this.perceelAdresSelectNode, 'disabled', true);
          }
        })),
        on(this.dichtstbijzijndeAdresCheckbox, 'change', lang.hitch(this, function() {
          if (this.dichtstbijzijndeAdresCheckbox.checked) {
            this.perceelAdresCheckbox.checked = false;
            this.vrijAdresCheckbox.checked = false;

            this._manueelAdresSelect.reset();
            this._manueelAdresSelect.set('disabled', true);
            domAttr.set(this.perceelAdresSelectNode, 'disabled', true);
          }
        })),
        on(this.vrijAdresCheckbox, 'change', lang.hitch(this, function() {
          if (this.vrijAdresCheckbox.checked) {
            this.perceelAdresCheckbox.checked = false;
            this.dichtstbijzijndeAdresCheckbox.checked = false;

            this._manueelAdresSelect.set('disabled', false);
            domAttr.set(this.perceelAdresSelectNode, 'disabled', true);
          }
          else {
            this._manueelAdresSelect.reset();
            this._manueelAdresSelect.set('disabled', true);
          }
        }))
      );
    },

    startup: function () {
      this.inherited(arguments);
      this._manueelAdresSelect.startup();
    },

    hide: function () {
      this._reset();
      this.inherited(arguments);
    },

    _okClick: function (evt) {
      evt.preventDefault();

      if (this._validate()) {
        this.emit('ok', {
          refAdres: this._getRefAdres()
        });
        this.hide();
      }
    },

    show: function(percelen, dichtstbijzijndeAdres) {
      this.inherited(arguments);

      if (percelen) {
        this._loadAdresPercelen(percelen);
      } else {
        domConstruct.empty(this.perceelAdresSelectNode);
        domClass.add(this.perceelAdresContainer, 'placeholder-disabled');
        query('input, select', this.perceelAdresContainer).attr({disabled: true});
      }

      if (dichtstbijzijndeAdres) {
        this._dichtstbijzijndeAdres = dichtstbijzijndeAdres;
        this.dichtstbijzijndeAdresNode.value = this._getAddressString(dichtstbijzijndeAdres);
      } else {
        domClass.add(this.dichtstbijzijndeAdresContainer, 'placeholder-disabled');
        query('input', this.dichtstbijzijndeAdresContainer).attr({disabled: true});
      }
    },

    _getRefAdres: function () {
      if (this.dichtstbijzijndeAdresCheckbox.checked) {
        return this._dichtstbijzijndeAdres;
      }
      if (this.perceelAdresCheckbox.checked) {
        var perceelAdres = this._adresStore.getSync(this.perceelAdresSelectNode.value);
        return this._parseAddressString(perceelAdres);
      }
      if (this.vrijAdresCheckbox.checked) {
        var adres = this._manueelAdres;
        adres.label = this._manueelAdresSelect.value;
        return adres;
      }
      return null;
    },

    _loadAdresPercelen: function(percelen) {
      this._adresStore.setData([]);
      domConstruct.empty(this.perceelAdresSelectNode);
      this.perceelAdresLoading.style.display = 'block';

      this.locatieService.getAdressenFromKadastralePercelen(percelen, this._adresStore).then(
        lang.hitch(this, function() {
          if (this._adresStore.data.length > 0) {
            array.forEach(this._adresStore.data, function(item) {
              /* jshint -W106 */
              domConstruct.place(
                '<option value="' + item.id + '">' + item.label + '</option>',
                this.perceelAdresSelectNode);
              /* jshint +W106 */
            }, this);
          } else {
            // disable perceel select
            domClass.add(this.perceelAdresContainer, 'placeholder-disabled');
            domConstruct.place(
              '<option value="-1" class="select-placeholder" selected>Geen adres gevonden voor de percelen.</option>',
              this.perceelAdresSelectNode);
            query('input, select', this.perceelAdresContainer).attr({disabled: true});
          }
        })
      ).always(
        lang.hitch(this, function() {
          this.perceelAdresLoading.style.display = 'none';
        })
      );
    },

    _cancelClick: function (evt) {
      evt.preventDefault();
      this.hide();
    },

    _reset: function () {
      domClass.remove(this.dichtstbijzijndeAdresContainer, 'placeholder-disabled');
      query('input[type="checkbox"]', this.dichtstbijzijndeAdresContainer)
        .attr({disabled: false});
      domClass.remove(this.perceelAdresContainer, 'placeholder-disabled');
      query('input, select', this.perceelAdresContainer).attr({disabled: false});

      this.perceelAdresCheckbox.checked = false;
      this.dichtstbijzijndeAdresCheckbox.checked = false;
      this.vrijAdresCheckbox.checked = false;

      this._manueelAdresSelect.reset();

      this._manueelAdresSelect.set('disabled', true);
      domAttr.set(this.perceelAdresSelectNode, 'disabled', true);

    },

    _validate: function () {
      var adres = this._getRefAdres();
      var valid = true;

      if (!adres) {
        valid = false;
      }

      if (!valid) {
        topic.publish('dGrowl', 'Selecteer een referentie adres of vul een adres in.', {
          'title': 'Geen adres gekozen',
          'sticky': true,
          'channel': 'error'
        });
      }

      return valid;
    },

    _parseAddressString: function (adresObj) {
      //Damstraat 74, 9220 Hamme
      var adresString = adresObj.label ? adresObj.label : adresObj;
      try {
        var adres = {};
        if (!adresString.includes(',')) {
          adres.gemeente = { naam: adresString};
        } else {
          var straatNummer = adresString.split(',')[0].trim().split(' ');
          var postcodeGemeente = adresString.split(',')[1].trim();
          adres.postcode = { nummer:
            postcodeGemeente.split(' ').length > 1 ? postcodeGemeente.split(' ')[0] : undefined };
          adres.gemeente = { naam: postcodeGemeente.substring(postcodeGemeente.indexOf(' ') + 1) };
          adres.straat = { naam: straatNummer[0].trim() };
          adres.adres = {
            huisnummer: straatNummer[1] ? straatNummer[1].trim() : undefined,
            busnummer: straatNummer[3] ? straatNummer[3].trim() : undefined,
            id: adresObj.id ? adresObj.id : undefined,
            uri: adresObj.uri ? adresObj.uri : undefined
          };
        }
        adres.type = this.refAdresType;
        return adres;
      } catch(err) {
        return adresString;
      }
    },

    _getAddressString: function (adres) {
      /* jshint -W106 */
      /* jshint maxcomplexity: 15 */
      if (adres) {
        var straat = (adres.straat ? adres.straat.naam  + ' ' : '')
          + (adres.adres && adres.adres.huisnummer ? adres.adres.huisnummer + ' ' : '')
          + (adres.adres && adres.adres.busnummer ? adres.adres.busnummer : '');
        var gemeente = (adres.postcode && adres.postcode.nummer ? adres.postcode.nummer + ' ' : '')
          + (adres.gemeente && adres.gemeente.naam ? adres.gemeente.naam + ' ' : '?')
          + (adres.land ?  '(' + adres.land + ')' : '');
        return straat ? straat + ', ' + gemeente : gemeente;
        /* jshint +W106 */
      } else {
        return '';
      }
    }
  });
});
