define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/LocatiePercelen.html',
  'dojo/dom-construct',
  'dojo/query',
  'dojo/on',
  'dojo/topic',
  'dgrid/OnDemandGrid',
  'dgrid/Keyboard',
  'dgrid/Selector',
  'dgrid/Selection',
  'dgrid/extensions/DijitRegistry',
  'dgrid/extensions/ColumnResizer',
  './TrackableMemoryStore',
  './locatiePercelen/RefAdresDialog'
], function (
  declare,
  WidgetBase,
  lang,
  array,
  TemplatedMixin,
  template,
  domConstruct,
  query,
  on,
  topic,
  OnDemandGrid,
  Keyboard,
  Selector,
  Selection,
  DijitRegistry,
  ColumnResizer,
  TrackableMemoryStore,
  RefAdresDialog
) {
  return declare([WidgetBase, TemplatedMixin], {

    templateString: template,
    baseClass: 'locatie-percelen',
    locatieService: null,
    locatie: null,
    refAdres: null,
    disabled: true,
    afdelingenStore: null,
    _perceelGrid: null,
    _perceelStore: null,
    _nearestAddress: null,
    _refAdresType: 'https://id.erfgoed.net/vocab/ontology#LocatieElementAdres',
    _perceelType: 'https://id.erfgoed.net/vocab/ontology#LocatieElementPerceel',
    _currentZone: null,
    _warningDisplayed: false,

    postCreate: function () {
      console.debug('LocatiePercelen::postCreate');
      this.inherited(arguments);

      this._perceelStore = new TrackableMemoryStore({ data: [], idProperty: 'capakey' });
      this._perceelGrid = this._createGrid({
        collection: this._perceelStore
      }, this.percelenNode);

      this._refAdresDialog = new RefAdresDialog({
        crabController: this.crabController,
        refAdresType: this._refAdresType
      });

      this.own(
        on(this._refAdresDialog, 'ok', lang.hitch(this, function(evt) {
          this._updateRefAdres(evt.refAdres);
        }))
      );
    },

    startup: function () {
      console.debug('LocatiePercelen::startup');
      this.inherited(arguments);
      this._perceelGrid.startup();
    },

    _updateRefAdres: function(adres) {
      console.debug('LocatiePercelen::_updateRefAdres', adres);
      this.refAdres = adres;
      this.refAdresNode.innerHTML = this._getAddressString(adres);
    },

    _getDichtstbijzijndeAdres: function(zone, useAsRefAdres) {
      if (useAsRefAdres) {
        this.refAdresNode.innerHTML = 'adres wordt opgehaald...';
      }
      this.crabController.getDichtstbijzijndeAdres(zone).then(lang.hitch(this, function (res) {
        if (res && res.found) {
          /* jshint -W106 */
          var newStyleAddress = {
            type: this._refAdresType,
            gemeente: {
              naam: res.address.gemeente,
              id: res.address.gemeente_id
            },
            postcode: res.address.postcode,
            straat: res.address.straat,
            straat_id: res.address.straat_id,
            huisnummer: res.address.huisnummer,
            huisnummer_id: res.address.huisnummer_id,
            subadres: res.address.subadres,
            subadres_id: res.address.subadres_id,
            land: res.address.land
          };
          /* jshint +W106 */
          this._nearestAddress = newStyleAddress;
          if (useAsRefAdres) {
            this._updateRefAdres(newStyleAddress);
          }
        } else {
          this._nearestAddress = undefined;
        }
      }));
    },

    enable: function() {
      this.disabled = false;
      query('.placeholder-container:not(.placeholder-always-disabled)', this.locatieContent)
        .removeClass('placeholder-disabled');
      query('.placeholder-container:not(.placeholder-always-disabled) input, '+
        '.placeholder-container:not(.placeholder-always-disabled) select', this.locatieContent)
        .attr({disabled: false});
      query('a.fa-pencil', this.locatieContent).removeClass('hide');

      // query('.placeholder-container:not(.placeholder-always-disabled) input#dichtstbijzijndeAdres-' + this.id,
      //   this.locatieContent).attr({disabled: true});

      this.refreshPercelenNode.style.display = 'inline-block';

      this._perceelGrid.styleColumn('remove', 'display: table-cell');
    },

    disable: function() {
      this.disabled = true;
      query('.placeholder-container:not(.placeholder-always-disabled)', this.locatieContent)
        .addClass('placeholder-disabled');
      query('.placeholder-container:not(.placeholder-always-disabled) input,'+
        '.placeholder-container:not(.placeholder-always-disabled) select', this.locatieContent)
        .attr({disabled: true});
      this.refreshPercelenNode.style.display = 'none';
      query('a.fa-pencil', this.locatieContent).addClass('hide');
      this._perceelGrid.styleColumn('remove', 'display: none;');
    },

    resize: function () {
      this._perceelGrid.resize();
    },

    _refreshPercelen: function(evt) {
      evt ? evt.preventDefault() : null;
      if (this._currentZone) {
        this.updatePercelen(this._currentZone);
      } else {
        topic.publish('dGrowl', 'Gelieve eerst een zone in te tekenen.', {
          'title':'Zone verplicht',
          'sticky': false,
          'channel': 'warn'
        });
      }
    },

    updateZone: function(zone) {
      this._currentZone = zone;
      if (zone) {
        this._getDichtstbijzijndeAdres(zone, true);
        this.updatePercelen(zone);
      }
      else {
        this._nearestAddress = undefined;
        this.refAdresNode.innerHTML = '';
        this._perceelStore = new TrackableMemoryStore({ data: [], idProperty: 'capakey' });
        this._perceelGrid.set('collection', this._perceelStore);
      }
    },

    updatePercelen: function () {
      this.locatieContent.style.display = 'none';
      this.locatieLoading.style.display = 'block';
      this.crabController.getKadastralePercelenInZone(this._currentZone).then(
        lang.hitch(this, function (result) {
          array.map(result, function (locatieElementPerceel) {
            locatieElementPerceel.type = this._perceelType;
            var perceel = locatieElementPerceel.perceel;
            var afdeling = this.afdelingenStore.get(perceel.afdelingsnummer);
            perceel.afdeling = afdeling ? afdeling.naam : perceel.afdelingsnummer;
          }, this);

          this._perceelStore = new TrackableMemoryStore({ data: result, idProperty: 'capakey' });
          this._perceelGrid.set('collection', this._perceelStore);

          this.locatieLoading.style.display = 'none';
          this.locatieContent.style.display = 'block';

          if (!this._warningDisplayed) {
            this._showPercelenWarning();
          }
        }),
        lang.hitch(this, function (error) {
          console.error(error);
          topic.publish('dGrowl', 'Er is een fout opgetreden bij het ophalen van de percelen data bij AGIV.', {
            'title': 'Fout bij het ophalen van de percelen',
            'sticky': false,
            'channel': 'warn'
          });
          this._perceelStore = new TrackableMemoryStore({ data: [], idProperty: 'capakey' });
          this._perceelGrid.set('collection', this._perceelStore);
          this.locatieLoading.style.display = 'none';
          this.locatieContent.style.display = 'block';
        })
      );
    },

    _showPercelenWarning: function () {
      // melding voor nakijken percelen
      this._warningDisplayed = true;
      topic.publish('dGrowl', 'Controleer steeds of de lijst met kadastrale percelen in orde is.', {
        'title': 'Opgelet',
        'sticky': false,
        'channel': 'warn'
      });
    },

    setData: function(locatie) {
      console.debug('LocatiePercelen::setData', locatie);
      this.locatie = locatie;

      //preload nearest address for ref adres dialog
      if (locatie.contour) {
        this._currentZone = locatie.contour;
        this._getDichtstbijzijndeAdres(locatie.contour, false);
      }

      if (locatie.elementen) {
        //set refAdres
        var refAdresArray = locatie.elementen.filter(lang.hitch(this, function (element) {
          return (element.type === this._refAdresType);
        }));
        if (refAdresArray.length > 0) {
          this.refAdres = refAdresArray[0];
          this.refAdresNode.innerHTML = this._getAddressString(this.refAdres);
        }
        else {
          this.refAdres = null;
          this.refAdresNode.innerHTML = '';
        }

        //set kadastrale percelen
        var kadPerceelList = locatie.elementen.filter(lang.hitch(this, function (element) {
          return (element.type === this._perceelType);
        }));
        array.forEach(kadPerceelList, function (kadPerceel) {
          kadPerceel.capakey = kadPerceel.perceel.capakey;
        });
        this._perceelStore = new TrackableMemoryStore({data: kadPerceelList, idProperty: 'capakey'});
        this._perceelGrid.set('collection', this._perceelStore);
      }

      //hide loading div
      this.locatieLoading.style.display = 'none';
      this.locatieContent.style.display = 'block';
    },

    getData: function() {
      console.debug('LocatiePercelen::getData');
      var elementen = [];

      if (this.refAdres) {
        elementen.push(this.refAdres);
      }

      this._perceelStore.fetchSync().forEach(function (perceel) {
        delete perceel.capakey; //remove the extra grid ids again
        elementen.push(perceel);
      });

      return elementen;
    },

    reset: function () {
      this.locatieLoading.style.display = 'none';
      this.locatieContent.style.display = 'block';

      this._perceelStore = new TrackableMemoryStore({ data: [], idProperty: 'capakey' });
      this._perceelGrid.set('collection', this._perceelStore);
      this.refAdres = null;
      this.refAdresNode.innerHTML = '';

      if (this.locatie) {
        this.setData(this.locatie);
      }
    },

    _createGrid: function(options, node) {
      /* jshint -W106 */
      var columns = {
        capakey: {
          label: 'Capakey'
        },
        afdeling: {
          label: 'Afdeling',
          formatter: function (value, object) {
            return object.perceel && object.perceel.afdeling ? object.perceel.afdeling : '';
            //'niscode: ' + object.kadastraal_perceel.niscode;
          }
        },
        sectie: {
          label: 'Sectie',
          formatter: function (value, object) {
            return object.perceel && object.perceel.sectie ? object.perceel.sectie : '';
          }
        },
        perceel: {
          label: 'Perceel',
          formatter: function (value, object) {
            return object.perceel && object.perceel.perceel ? object.perceel.perceel : '';
          }
        },
        remove: {
          label: '',
          resizable: false,
          sortable: false,
          renderCell: lang.hitch(this, function (object) {
            if (!object) { return null; }
            var div = domConstruct.create('div', { 'class': 'dGridHyperlink', 'innerHTML': '' });
            domConstruct.create('a', {
              href: '#',
              title: 'Verwijder dit perceel',
              'class': 'fa fa-trash',
              innerHTML: '',
              onclick: lang.hitch(this, function (evt) {
                evt.preventDefault();
                this._removeRow(object);
              })
            }, div);
            return div;
          })
        }
      };
      /* jshint +W106 */

      return new (declare([OnDemandGrid, Keyboard, DijitRegistry, ColumnResizer, Selector, Selection]))({
        className: 'percelenGrid',
        collection: options.collection,
        columns: columns,
        selectionMode: 'none',
        noDataMessage: 'Er zijn geen kadastrale percelen beschikbaar.',
        loadingMessage: 'data aan het ophalen...'
      }, node);
    },

    validate: function() {
      var values = this.getData();
      var valid = true;

      array.forEach(values, function(perceel) {
        /* jshint -W106 */
        if (perceel && perceel.ref_adres && !perceel.adres) {
          /* jshint +W106 */
          valid = false;
        }
      });
      return valid;
    },

    refreshGrid: function() {
      this._perceelGrid.resize();
    },

    _removeRow: function (object) {
      if (object && object.perceel && object.perceel.capakey) {
        this._perceelStore.remove(object.perceel.capakey);
      }
    },

    _getAddressString: function (adres) {
      /* jshint -W106 */
      if (adres) {
        var straat = (adres.straat ? adres.straat  + ' ' : '')
          + (adres.huisnummer ? adres.huisnummer + ' ' : '')
          + (adres.subadres ? adres.subadres : '');
        var gemeente = (adres.postcode ? adres.postcode + ' ' : '')
          + (adres.gemeente && adres.gemeente.naam ? adres.gemeente.naam + ' ' : '?')
          + (adres.land ?  '(' + adres.land + ')' : '');
        return straat ? straat + ', ' + gemeente : gemeente;
        /* jshint +W106 */
      } else {
        return '';
      }
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

    _compareAddresses: function(adres, compare) {
      if (adres && compare) {
        if ((adres.land === compare.land) &&
          (adres.gemeente === compare.gemeente) &&
          (adres.postcode === compare.postcode) &&
          (adres.straat === compare.straat) &&
          (adres.huisnummer === compare.huisnummer)) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    },

    _openEditRefAdres: function(evt) {
      evt ? evt.preventDefault() : null;
      this._refAdresDialog.show(this._perceelStore.data, this._nearestAddress);
    }
  });
});
