/**
 * @module controllers/CrabController
 */
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/request/xhr',
  'dojo/json',
  'dojo/_base/array',
  'olv319',
  'dojo/store/Memory',
  'dojo/store/JsonRest',
  'dojo/promise/all',
  'jsts/jsts'
], function (
  declare,
  lang,
  Deferred,
  xhr,
  JSON,
  array,
  ol,
  Memory,
  JsonRest,
  all,
  jsts
) {
  return declare(null, {

    agivGRBUrl: null,
    adresUrl: 'crab/percelen/',
    capakeyUrl: 'capakey/percelen/',
    checkFlandersUrl: 'check_within_flanders',
    targetNearestAddress: 'nearest_address',
    crabHost: null,
    nearestAdresUrl: null,
    gemeenteStore: null,
    landenStore: null,
    _geolocationStore: null,

    constructor:function(args) {
      declare.safeMixin(this, args);
      // geolocation store
      this._geolocationStore = new JsonRest({
        target: this.crabHost + 'geolocation/'
      });
    },

    /**
     * Haalt percelen op obv een geselecteerde zone.
     * @param zone
     * @returns {*}
     */
    searchPerceelByZone: function (zone) {
      var promises = [];
      array.forEach(zone.coordinates, lang.hitch(this, function(polygon) {
        var filter = new ol.format.filter.Intersects(
          'SHAPE',
          new ol.geom.Polygon(polygon),
          'urn:x-ogc:def:crs:EPSG:31370'
        );
        var featureRequest = new ol.format.WFS().writeGetFeature({
          srsName: 'urn:ogc:def:crs:EPSG:6.9:31370',
          featureNS: 'https://geo.agiv.be/ogc/wfs/grb',
          featurePrefix: 'grb',
          featureTypes: ['GRB_-_Adp_-_administratief_perceel'],
          filter: filter
        });

        var call = xhr.post(this.agivGRBUrl, {
          data: new XMLSerializer().serializeToString(featureRequest),
          headers: {
            'X-Requested-With': '',
            'Content-Type': 'application/xml'
          }
        });
        promises.push(call);
      }));

      return all(promises);
    },

    /**
     * Leest de features in van een WFS en geeft deze terug.
     * @param wfs
     * @returns {*}
     */
    readWfs: function (wfs) {
      var formatter = new ol.format.WFS({
        featureNS: 'https://geo.agiv.be/ogc/wfs/grb',
        featureType: 'GRB_-_Adp_-_administratief_perceel'
      });
      return formatter.readFeatures(wfs, {});
    },

    /**
     * Haalt een adres op obv de capakey van een perceel.
     * @param capakey
     * @returns {*}
     */
    getAdresByCapakey: function(capakey) {
      return xhr.get(this.crabHost + this.adresUrl + capakey, {
        handleAs: 'customJson',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': '',
          'Content-Type': 'application/xml'
        }
      });
    },

    /**
     * Haalt de info gekoppeld aan een capakey op en geeft deze terug.
     * @param capakey
     * @returns {*}
     */
    getInfoByCapakey: function(capakey) {
      return xhr.get(this.crabHost + this.capakeyUrl + capakey, {
        handleAs: 'customJson',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': '',
          'Content-Type': 'application/xml'
        }
      });
    },

    getDichtstbijzijndeAdres: function(zone) {
      var data = JSON.stringify(zone);
      return xhr(this.nearestAdresUrl + this.targetNearestAddress, {
        method: 'POST',
        data: data,
        handleAs: 'customJson',
        headers: {
          'X-Requested-With': '',
          'Content-Type': 'application/json'
        }
      });
    },

    /**
     * Haalt de kadastrale percelen op in een zone.
     * @param zone
     * @returns {Deferred}
     */
    getKadastralePercelenInZone: function(zone) {
      var deferred = new Deferred();
      zone = this._bufferZone(zone, -0.0001);
      this.searchPerceelByZone(zone).then(lang.hitch(this, function(result) {
        var percelen = [];
        array.forEach(result, lang.hitch(this, function(coll) {
          percelen = percelen.concat(this.readWfs(coll));
        }));
        var promises = [];
        var kadPercelen = [];
        array.forEach(percelen, lang.hitch(this, function(perceel) {
          promises.push(
            this.getInfoByCapakey(perceel.get('CAPAKEY')).then(lang.hitch(this, function(results) {
              var kadPerc = {};
              kadPerc.afdeling = results.sectie.afdeling.naam;
              kadPerc.sectie = results.sectie.id;
              kadPerc.perceel = results.id;
              kadPerc.capakey = perceel.get('CAPAKEY');
              kadPerc.oppervlakte = perceel.get('OPPERVL');

              /* jshint -W106 */
              kadPercelen.push({
                kadastraal_perceel: kadPerc,
                perceeltype: { id: 1 },
                id: perceel.get('CAPAKEY')
              });
              /* jshint +W106 */

            }), function(err) {
              console.log(err);
              deferred.reject(err);
            })
          );
        }));
        all(promises).then(function() {
          deferred.resolve({kadPercelen: kadPercelen});
        }, function(err) {
          console.log(err);
          deferred.reject(err);
        });
      }), function(err) {
        console.log(err);
        deferred.reject(err);
      });
      return deferred;
    },

    /**
     * Haalt adressen op van kadastrale percelen.
     * @param percelen
     * @param store
     * @returns {Deferred}
     */
    getAdressenFromKadastralePercelen: function(percelen, store) {
      var deferred = new Deferred();
      var promises = [];
      array.forEach(percelen, lang.hitch(this, function(perceel) {
        promises.push(
          /* jshint -W106 */
          this.getAdresByCapakey(perceel.kadastraal_perceel.capakey).then(lang.hitch(this, function (results) {
            var adressen = results.postadressen;
            if (adressen.length > 0) {
              array.forEach(adressen, lang.hitch(this, function (adres) {
                var data = {};
                data.adres = this._parseAddressString(adres);
                data.perceel = perceel;
                data.id = btoa(adres);

                store.put(data);
              }));
            }
          }), function(err) {
            console.log(err);
            deferred.reject(err);
          })
          /* jshint +W106 */
        );
      }));
      all(promises).then(function() {
        deferred.resolve('succes');
      }, function(err) {
        console.log(err);
        deferred.reject(err);
      });
      return deferred;
    },

    updateOppervlaktePerceel: function (kadastraalPerceel) {
      var deferred = new Deferred();

      var capakey = kadastraalPerceel.capakey;

      var featureRequest = new ol.format.WFS().writeGetFeature({
        srsName: 'urn:ogc:def:crs:EPSG:6.9:31370',
        featureNS: 'https://geo.agiv.be/ogc/wfs/grb',
        featurePrefix: 'grb',
        featureTypes: ['GRB_-_Adp_-_administratief_perceel'],
        filter: ol.format.filter.equalTo('capakey', capakey)
      });

      xhr.post(this.agivGRBUrl, {
        data: new XMLSerializer().serializeToString(featureRequest),
        headers: {
          'X-Requested-With': '',
          'Content-Type': 'application/xml'
        }
      }).then(
        lang.hitch(this, function (result) {
          var perceelopp = 0;
          array.forEach(this.readWfs(result), function (perceel) {
            perceelopp += perceel.get('OPPERVL');
          }, this);
          kadastraalPerceel.oppervlakte = perceelopp;
          deferred.resolve(perceelopp);
        }),
        lang.hitch(this, function (error) {
          console.error('CrabController::getOppervlaktePerceel', error);
          deferred.reject('Error getting perceel opp.');
        })
      );
      return deferred;
    },

    /**
     * Geeft een store terug om gelocaties te kunnen bepalen
     * @returns {Object} De JsonRest store die de geolocation service bevraagt
     */
    getGeolocationStore: function () {
      return this._geolocationStore;
    },

    /**
     * Controleert of een perceel al toegevoegd is aan de percelenStore.
     * @param store
     * @param perceel
     * @returns {boolean}
     */
    checkPerceelAlreadyExists: function(store, perceel) {
      var perceelList = store.data;
      var alreadyExists = array.filter(perceelList, lang.hitch(this, function(perc) {
        /* jshint -W106 */
        if (perc.kadastraal_perceel && perceel.kadastraal_perceel &&
          (perc.kadastraal_perceel.afdeling === perceel.kadastraal_perceel.afdeling) &&
          (perc.kadastraal_perceel.sectie === perceel.kadastraal_perceel.sectie) &&
          (perc.kadastraal_perceel.perceel === perceel.kadastraal_perceel.perceel) &&
          (perc.kadastraal_perceel.capakey === perceel.kadastraal_perceel.capakey)) {
          /* jshint +W106 */
          // perceel info is equal, is address?
          if (perc.adres && perceel.adres) {
            if ((perc.adres.land === perceel.adres.land) &&
              (perc.adres.gemeente === perceel.adres.gemeente) &&
              (perc.adres.postcode === perceel.adres.postcode) &&
              (perc.adres.straat === perceel.adres.straat) &&
              (perc.adres.huisnummer === perceel.adres.huisnummer)) {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        } else {
          return false;
        }
      }));
      if (alreadyExists.length > 0) {
        return false;
      } else {
        return true;
      }
    },

    _bufferZone: function(zone, buffer) {
      var workingzone = lang.clone(zone);
      var crs = zone.crs;

      /* jshint -W117 */
      var parser = new jsts.io.GeoJSONReader();
      var writer = new jsts.io.GeoJSONWriter();
      /* jshint +W117 */
      var ol3Geom = parser.read(workingzone);
      var buffered = ol3Geom.buffer(buffer);
      workingzone = writer.write(buffered);

      if (workingzone.type === 'Polygon') {
        var coordinates = [];
        coordinates.push(workingzone.coordinates);
        workingzone = { type: 'MultiPolygon', crs: crs, coordinates: coordinates };
      }

      return workingzone;
    },

    /**
     * Splitst een adresstring in de nodige delen.
     * @param addresString
     * @returns {*}
     * @private
     */
    _parseAddressString: function (addresString) {
      //Damstraat 74, 9220 Hamme
      try {
        var addres = {};
        var straatNummer = addresString.split(',')[0].trim();
        var postcodeGemeemte = addresString.split(',')[1].trim();
        addres.postcode = postcodeGemeemte.split(' ')[0];
        addres.gemeente = postcodeGemeemte.substring(postcodeGemeemte.indexOf(' ') + 1);
        addres.huisnummer = straatNummer.substring(straatNummer.lastIndexOf(' ')).trim();
        addres.straat = straatNummer.substring(0, straatNummer.lastIndexOf(' ')).trim();
        /* jshint -W106 */
        addres.omschrijving_straat = addres.straat + ', ' + addres.huisnummer;
        /* jshint +W106 */
        return addres;
      }
      catch(err) {
        return addresString;
      }
    },

    /**
     * Controleert of een ingetekende zone volledig in Vlaanderen ligt.
     * @param zone
     * @returns {*}
     */
    checkZoneInFlanders: function(zone) {
      var data = JSON.stringify(zone);
      return xhr(this.nearestAdresUrl + this.checkFlandersUrl, {
        method: 'POST',
        data: data,
        handleAs: 'customJson',
        headers: {
          'X-Requested-With': '',
          'Content-Type': 'application/json'
        }
      });
    }

  });
});