define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dijit/_TemplatedMixin',
  'dojo/text!./locatiePercelen/templates/LocatiePercelen.html',
  'dojo/dom-construct',
  'dojo/dom-class',
  'dojo/dom-attr',
  'dojo/query',
  'dojo/on',
  'dojo/promise/all',
  'dojo/topic',
  'dgrid/OnDemandGrid',
  'dgrid/Keyboard',
  'dgrid/Editor',
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
  domClass,
  domAttr,
  query,
  on,
  all,
  topic,
  OnDemandGrid,
  Keyboard,
  Editor,
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
    crabController: null,
    zone: null,
    refAdres: null,
    nearestAddress: null,
    disabled: true,
    percelen: null,
    initialized: false,
    _perceelGrid: null,
    _perceelStore: null,

    // crabController urls
    crabHost: null,


    postCreate: function () {
      console.debug('LocatiePercelen::postCreate');
      this.inherited(arguments);

      this._perceelStore = new TrackableMemoryStore({ data: [], idProperty: 'capakey' });
      this._perceelGrid = this._createGrid({
        collection: this._perceelStore
      }, this.percelenNode);

      this._refAdresDialog = new RefAdresDialog({
        crabController: this.crabController
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
      this.initialized = true;
      this._perceelGrid.startup();
      this._refAdresDialog.startup();
      this.refreshGrid();
    },

    _updateRefAdres: function(refAdres) {
      console.debug('LocatiePercelen::_updateRefAdres', refAdres);
      this.refAdres = refAdres;
      var adresObj = {gemeente: '-'};

      if (!refAdres) {
        return;
      }
      else if (refAdres.type === 'dichtstbijzijnd') {
        adresObj = this.nearestAddress;
      }
      else if (refAdres.type === 'vrij') {
        adresObj = refAdres.refAdres;
      }
      else if (refAdres.type === 'perceel') {
        adresObj = refAdres.refAdres.adres;
      }

      this.refAdresNode.innerHTML = this._getAddressString(adresObj);
    },

    _getDichtstbijzijndeAdres: function(useAsRefAdres, compareAddress) {
      if (this.zone) {
        this.crabController.getDichtstbijzijndeAdres(this.zone).then(lang.hitch(this, function (res) {
          if (res && res.found) {
            this.nearestAddress = res.address;
            if (compareAddress) {
              if (this._compareAddresses(this.nearestAddress, compareAddress)) {
                this._updateRefAdres({type: 'dichtstbijzijnd'});
              } else {
                this._updateRefAdres({type: 'vrij', refAdres: compareAddress});
              }
            }
            if (useAsRefAdres) {
              this._updateRefAdres({type: 'dichtstbijzijnd'});
            }
          } else {
            this.nearestAddress = undefined;
          }
        }));
      }
    },

    enable: function() {
      this.disabled = false;
      query('.placeholder-container:not(.placeholder-always-disabled)', this.locatieContent)
        .removeClass('placeholder-disabled');
      query('.placeholder-container:not(.placeholder-always-disabled) input, '+
        '.placeholder-container:not(.placeholder-always-disabled) select', this.locatieContent)
        .attr({disabled: false});
      query('a.fa-pencil', this.locatieContent).removeClass('hide');

      query('.placeholder-container:not(.placeholder-always-disabled) input#dichtstbijzijndeAdres-' + this.id,
        this.locatieContent).attr({disabled: true});

      this.refreshPercelenNode.style.display = 'inline-block';

      if (this.initialized) {
        this._perceelGrid.styleColumn('remove', 'display: table-cell');
      }
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
      if (this.initialized) {
        this._perceelGrid.styleColumn('remove', 'display: none;');
      }
    },

    resize: function () {
      if (this.initialized) {
        this._perceelGrid.resize();
      }
    },

    _refreshPercelen: function(evt) {
      evt ? evt.preventDefault() : null;
      if (this.zone) {
        this.refreshPercelen(this.zone);
      } else {
        topic.publish('dGrowl', 'Gelieve eerst een zone in te tekenen', {
          'title':'Locatie verplicht',
          'sticky': true,
          'channel': 'error'
        });
      }
    },

    refreshPercelen: function(zone) {
      this.zone = zone;
      this.locatieContent.style.display = 'none';
      this.locatieLoading.style.display = 'block';
      this._getDichtstbijzijndeAdres(true);

      this.crabController.getKadastralePercelenInZone(this.zone).then(
        lang.hitch(this, function (result) {
          var resultPercelen = array.map(result.kadPercelen, function(perc) {
            var newPerc = lang.clone(perc);
            /* jshint -W106 */
            newPerc.capakey = perc.kadastraal_perceel.capakey;
            /* jshint +W106 */
            return newPerc;
          });
          this._perceelStore = new TrackableMemoryStore({ data: [], idProperty: 'capakey' });
          array.forEach(resultPercelen, function(perc) {
            if (!this._perceelStore.getSync(perc.capakey)) {
              this._perceelStore.add(perc);
            }
          },this);
          this._perceelGrid.set('collection', this._perceelStore);
          this.locatieLoading.style.display = 'none';
          this.locatieContent.style.display = 'block';
          this._updatePerceelOppervlakte();
          this.refreshGrid();
          // melding voor nakijken percelen
          topic.publish('dGrowl', 'Gelieve de kadastrale percelen na te kijken.', {
            'title': '',
            'sticky': false,
            'channel': 'warn'
          });
        }),
        function (error) {
          console.error(error);
          topic.publish('dGrowl', 'Er is een fout opgetreden bij het ophalen van de percelen data.', {
            'title': 'Fout bij het ophalen van de percelen',
            'sticky': false,
            'channel': 'warn'
          });
        }
      );

    },

    setData: function(percelen) {
      if (!percelen) {
        return;
      }

      // refAdres
      var refAdresPerceelArray = percelen.filter(lang.hitch(this, function (perceel) {
        /* jshint -W106 */
        return (perceel.ref_adres);
        /* jshint +W106 */
      }));

      var refAdresPerceel;
      if (refAdresPerceelArray.length > 0) {
        refAdresPerceel = refAdresPerceelArray[0];
        console.debug('lcatiepercelen::setdata REFADRES', refAdresPerceel);
      }

      if (refAdresPerceel) {
        this.refAdres = {};
        /* jshint -W106 */
        this.refAdresNode.innerHTML = this._getAddressString(refAdresPerceel.adres);

        if (refAdresPerceel.kadastraal_perceel) {
          this.refAdres.type = 'perceel';
          this.refAdres.refAdres = {};
          this.refAdres.refAdres.perceel = {};
          this.refAdres.refAdres.perceel.kadastraal_perceel = refAdresPerceel.kadastraal_perceel;
          this.refAdres.refAdres.adres = refAdresPerceel.adres;
        } else {
          //check for dichtstbijzijnd adres && vrij adres
          this._getDichtstbijzijndeAdres(false, refAdresPerceel.adres);
        }
      }

      //openbaar domein
      var openbaarDomein = percelen.some(function(perceel) {
        return (perceel.perceeltype && perceel.perceeltype.id === 2);
      }, this);
      if (openbaarDomein) {
        this.domeinCheckbox.checked = true;
      }

      //kadastrale percelen
      var kadPerceelList = percelen.filter(lang.hitch(this, function (perc) {
        /* jshint -W106 */
        return (perc.perceeltype.id !== 2 && perc.kadastraal_perceel);
        /* jshint +W106 */
      }));
      var kadPerceelListWithId = array.map(kadPerceelList, function(perceel) {
        var newPerceel =lang.clone(perceel);
        newPerceel.capakey = perceel.kadastraal_perceel.capakey;
        return newPerceel;
      });
      this._perceelStore = new TrackableMemoryStore({ data: kadPerceelListWithId, idProperty: 'capakey' });
      this._perceelGrid.set('collection', this._perceelStore);

      // if kadastraal_perceel, get nearest address => can't be refadres.
      this._getDichtstbijzijndeAdres(false);

      // update oppervlakte
      this._updatePerceelOppervlakte();

      this.locatieLoading.style.display = 'none';
      this.locatieContent.style.display = 'block';
    },

    getData: function() {
      console.debug('LocatiePercelen::getData' );
      var percelen = [];
      var refAdres = this.refAdres;

      /* jshint -W106 */
      // openbaar domein
      if (this.domeinCheckbox.checked) {
        percelen.push({
          perceeltype: { id: 2 },
          ref_adres: false
        });
      }

      // percelen
      var capakey;
      if (refAdres && refAdres.type === 'perceel') {
        capakey = refAdres.refAdres.perceel.kadastraal_perceel.capakey;
      }

      array.forEach(this._perceelStore.fetchSync(), function (perceel) {
        if (capakey && capakey === perceel.kadastraal_perceel.capakey) {
          perceel.ref_adres = true;
          perceel.adres = refAdres.refAdres.adres;
        }
        else {
          perceel.ref_adres = false;
        }
        if (isNaN(perceel.id)) {
          delete perceel.id;
        }
        percelen.push(perceel);
      });

      // dichtstbijzijnd adres
      if (refAdres && refAdres.type === 'dichtstbijzijnd') {
        percelen.push({
          perceeltype: { id: 1 },
          ref_adres: true,
          adres: this.nearestAddress
        });
      }

      //vrij adres
      if (refAdres && refAdres.type === 'vrij') {
        percelen.push({
          perceeltype: { id: 1 },
          ref_adres: true,
          adres: refAdres.refAdres
        });
      }
      /* jshint +W106 */

      return percelen;
    },

    reset: function(percelen, zone) {
      this.locatieLoading.style.display = 'none';
      this.locatieContent.style.display = 'block';
      this._perceelStore = new TrackableMemoryStore({ data: [], idProperty: 'capakey' });
      this._perceelGrid.set('collection', this._perceelStore);
      this.refAdres = null;
      this.refAdresNode.innerHTML = '';
      this.refreshGrid();
      this.domeinCheckbox.checked = false;

      if (percelen && zone) {
        this.zone = zone;
        this.setData(percelen);
        this._updateRefAdres(this.refAdres);
      } else {
        this._updatePerceelOppervlakte();
      }
    },

    _createGrid: function(options, node) {
      /* jshint -W106 */
      var columns = {
        capakey: {
          label: 'Capakey',
          get: function (object) { return object; },
          formatter: function (object) {
            if (object && object.kadastraal_perceel) {
              return object.kadastraal_perceel.capakey;
            }
          }
        },
        afdeling: {
          label: 'Afdeling',
          get: function (object) { return object; },
          formatter: function (object) {
            if (object && object.kadastraal_perceel) {
              return object.kadastraal_perceel.afdeling;
            }
          }
        },
        sectie: {
          label: 'Sectie',
          get: function (object) { return object; },
          formatter: function (object) {
            if (object && object.kadastraal_perceel) {
              return object.kadastraal_perceel.sectie;
            }
          }
        },
        perceel: {
          label: 'Perceel',
          get: function (object) { return object; },
          formatter: function (object) {
            if (object && object.kadastraal_perceel) {
              return object.kadastraal_perceel.perceel;
            }
          }
        },
        oppervlakte: {
          label: 'Opp. (m²)',
          get: function (object) { return object; },
          formatter: function (object) {
            if (object && object.kadastraal_perceel) {
              if (object.kadastraal_perceel.oppervlakte) {
                return parseFloat(object.kadastraal_perceel.oppervlakte).toFixed(2);
              } else {
                return '-';
              }
            }
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
      /* jshint -W106 */
      if (object && object.kadastraal_perceel && object.kadastraal_perceel.capakey) {
        this._perceelStore.remove(object.kadastraal_perceel.capakey);
      }
      /* jshint +W106 */
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

    _updatePerceelOppervlakte: function() {
      console.debug('LocatiePercelen::_updatePerceelOppervlakte');
      var opp = 0;
      var promises = [];
      array.forEach(this._perceelStore.fetchSync(), function(item) {
        /* jshint -W106 */
        var kadastraalPerceel = item.kadastraal_perceel;
        /* jshint +W106 */
        if (kadastraalPerceel && kadastraalPerceel.oppervlakte) {
          opp += parseFloat(kadastraalPerceel.oppervlakte);
        }
        else {
          promises.push(this.crabController.updateOppervlaktePerceel(kadastraalPerceel));
        }
      }, this);
      all(promises).then(
        lang.hitch(this, function (result) {
          array.forEach(result, function (perceelopp) {
            opp += parseFloat(perceelopp);
          });
          this.totaleOppPercelen.innerHTML = parseFloat(opp).toFixed(2);
        }),
        lang.hitch(this, function (error) {
          console.error('LocatiePercelen::_updatePerceelOppervlakte::all', error);
          this.totaleOppPercelen.innerHTML = 'Er is een fout opgetreden!';
        })
      );

    },

    updateZoneOppervlakte: function(opp) {
      if (opp !== null) {
        this.totaleOppZone.innerHTML = parseFloat(opp).toFixed(2);
      }
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
      this._refAdresDialog.show(this._perceelStore.data, this.nearestAddress, this.refAdres);
    }
  });
});
