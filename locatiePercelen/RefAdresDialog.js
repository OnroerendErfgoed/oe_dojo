define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/topic',
  'dojo/on',
  'dojo/query',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/Dialog',
  'dojo/text!./templates/RefAdresDialog.html',
  'dijit/form/FilteringSelect',
  '../TrackableMemoryStore'
], function (
  declare,
  lang,
  array,
  topic,
  on,
  query,
  domClass,
  domConstruct,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  Dialog,
  template,
  FilteringSelect,
  TrackableMemoryStore
) {
  return declare([Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'refadres-dialog',
    title: 'Wijzig referentie adres',
    crabController: null,
    _adresStore: null,
    _manueelAdresSelect: null,
    _manueelAdres: null,

    postCreate: function () {
      this.inherited(arguments);

      this._adresStore = new TrackableMemoryStore({ data: [], idProperty: 'id' });

      var manueelAdresStore = this.crabController.getGeolocationStore();
      // filteringselect voor vrij adres input
      this._manueelAdresSelect = new FilteringSelect({
        store: manueelAdresStore,
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
          manueelAdresStore.get(val).then(lang.hitch(this, function (data) {
            this._manueelAdres = this._parseAddressObject(data);
          }));
        })
      }, this.vrijAdresNode);

      // checkbox events
      this.own(
        on(this.perceelAdresCheckbox, 'change', lang.hitch(this, function() {
          if (this.perceelAdresCheckbox.checked) {
            this.dichtstbijzijndeAdresCheckbox.checked = false;
            this.vrijAdresCheckbox.checked = false;
          }
        })),
        on(this.dichtstbijzijndeAdresCheckbox, 'change', lang.hitch(this, function() {
          if (this.dichtstbijzijndeAdresCheckbox.checked) {
            this.perceelAdresCheckbox.checked = false;
            this.vrijAdresCheckbox.checked = false;
          }
        })),
        on(this.vrijAdresCheckbox, 'change', lang.hitch(this, function() {
          if (this.vrijAdresCheckbox.checked) {
            this.perceelAdresCheckbox.checked = false;
            this.dichtstbijzijndeAdresCheckbox.checked = false;
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
      console.debug('RefAdresDialog::_okClick');
      evt.preventDefault();

      if (this._validate()) {
        this.emit('ok', {
          refAdres: this._getRefAdres()
        });
        this.hide();
      }
    },

    show: function(percelen, dichtstbijzijndeAdres, refAdres) {
      this.inherited(arguments);

      if (percelen) {
        this._loadAdresPercelen(percelen);
      } else {
        domConstruct.empty(this.perceelAdresSelectNode);
        domClass.add(this.perceelAdresContainer, 'placeholder-disabled');
        query('input, select', this.perceelAdresContainer).attr({disabled: true});
      }

      if (dichtstbijzijndeAdres && dichtstbijzijndeAdres.gemeente) {
        /* jshint -W106 */
        this.dichtstbijzijndeAdresNode.value = (dichtstbijzijndeAdres.omschrijving_straat ?
          dichtstbijzijndeAdres.omschrijving_straat + ', ' : '') + (dichtstbijzijndeAdres.postcode ?
          dichtstbijzijndeAdres.postcode + ' ' : '') + dichtstbijzijndeAdres.gemeente;
        /* jshint +W106 */
      } else {
        domClass.add(this.dichtstbijzijndeAdresContainer, 'placeholder-disabled');
        query('input', this.dichtstbijzijndeAdresContainer).attr({disabled: true});
      }

      if (refAdres) {
        console.debug('preset selection', refAdres);
        if (refAdres.type === 'perceel') {
          this.perceelAdresCheckbox.checked = true;
        }
        else if (refAdres.type === 'vrij') {
          this.vrijAdresCheckbox.checked = true;
          this._manueelAdres = refAdres.refAdres;
          this._manueelAdresSelect.attr('displayedValue', this._getAddressString(refAdres.refAdres));
        }
        else {
          this.dichtstbijzijndeAdresCheckbox.checked = true;
        }
      }
    },

    _getRefAdres: function() {
      if (this.dichtstbijzijndeAdresCheckbox.checked) {
        return {
          type: 'dichtstbijzijnd'
        };
      }
      else if (this.perceelAdresCheckbox.checked) {
        return {
          type: 'perceel',
          refAdres: this._adresStore.getSync(this.perceelAdresSelectNode.value)
        };
      }
      else if (this.vrijAdresCheckbox.checked) {
        return {
          type: 'vrij',
          refAdres: this._manueelAdres
        };
      }
      else {
        return null;
      }
    },

    _loadAdresPercelen: function(percelen) {
      this._adresStore.setData([]);
      domConstruct.empty(this.perceelAdresSelectNode);
      this.perceelAdresLoading.style.display = 'block';

      this.crabController.getAdressenFromKadastralePercelen(percelen, this._adresStore).then(
        lang.hitch(this, function() {
          if (this._adresStore.data.length > 0) {
            array.forEach(this._adresStore.data, function(item) {
              /* jshint -W106 */
              domConstruct.place(
                '<option value="' + item.id + '">' + (item.adres.omschrijving_straat ?
                item.adres.omschrijving_straat + ', ' : '') + (item.adres.postcode ?
                item.adres.postcode + ' ' : '') + item.adres.gemeente + '</option>',
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
      console.debug('RefAdresDialog::_cancelClick');
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
    },

    _validate: function () {
      var adres = this._getRefAdres();
      var valid = true;

      if (!adres || !adres.type) {
        valid = false;
      }
      else if (adres.type !== 'dichtstbijzijnd' && !adres.refAdres) {
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

    _parseAddressString: function (adresString) {
      //Damstraat 74, 9220 Hamme
      try {
        var adres = {};
        var straatNummer = adresString.split(',')[0].trim();
        var postcodeGemeemte = adresString.split(',')[1].trim();
        adres.postcode = postcodeGemeemte.split(' ')[0];
        adres.gemeente = postcodeGemeemte.substring(postcodeGemeemte.indexOf(' ') + 1);
        adres.huisnummer = straatNummer.substring(straatNummer.lastIndexOf(' ')).trim();
        adres.straat = straatNummer.substring(0, straatNummer.lastIndexOf(' ')).trim();
        /* jshint -W106 */
        adres.omschrijving_straat = adres.straat + ' ' + adres.huisnummer;
        /* jshint +W106 */
        return adres;
      }
      catch(err) {
        return adresString;
      }
    },

    _parseAddressObject: function(adresObj) {
      if (adresObj && adresObj.locatie && adresObj.type) {
        var adres = {};
        if (adresObj.type === 'crab_straat') {
          try {
            adres.straat = adresObj.locatie.split(',')[0].trim();
            /* jshint -W106 */
            adres.omschrijving_straat = adres.straat;
            /* jshint +W106 */
            adres.gemeente = adresObj.locatie.split(',')[1].trim();
          } catch (err) {
            return adresObj.locatie;
          }

        } else if (adresObj.type.indexOf('crab_huisnummer') >= 0) {
          adres = this._parseAddressString(adresObj.locatie);

        } else if (adresObj.type === 'crab_gemeente') {
          adres.gemeente = adresObj.locatie;
        }
        return adres;
      }
      return null;
    },

    _getAddressString: function (adres) {
      /* jshint -W106 */
      if (adres) {
        return (adres.omschrijving_straat ?
          adres.omschrijving_straat + ', ' : '') + (adres.postcode ?
          adres.postcode + ' ' : '') + adres.gemeente;
        /* jshint +W106 */
      } else {
        return '';
      }
    }
  });
});
