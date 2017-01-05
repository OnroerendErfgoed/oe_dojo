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
  'jsts/jsts',
  'proj4'
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
  jsts,
  proj4
) {
  return declare(null, {

    agivGRBUrl: null,
    crabUrl: null,
    appUrl: null,
    adresUrl: 'crab/percelen/',
    capakeyUrl: 'capakey/percelen/',
    checkFlandersUrl: 'check_within_flanders',
    targetNearestAddress: 'nearest_address',
    targetAfdelingen: 'capakey/afdelingen',
    _geolocationStore: null,

    constructor:function(args) {
      declare.safeMixin(this, args);

      // set projections for OL adhv Proj4
      this._defineProjections(proj4);

      // geolocation store
      this._geolocationStore = new JsonRest({
        target: this.crabUrl + 'geolocation/'
      });
    },

    _defineProjections: function (proj4) {
      if (!window.proj4) {
        window.proj4 = proj4;
      }
      proj4.defs("EPSG:31370", "+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.869,52.2978,-103.724,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs"); //epsg.io

      // Define aliases
      proj4.defs('urn:ogc:def:crs:EPSG::31370', proj4.defs('EPSG:31370'));
      proj4.defs('urn:ogc:def:crs:EPSG:6.9:31370', proj4.defs('EPSG:31370'));
      proj4.defs('urn:x-ogc:def:crs:EPSG:31370', proj4.defs('EPSG:31370'));
      proj4.defs('http://www.opengis.net/gml/srs/epsg.xml#31370', proj4.defs('EPSG:31370'));
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
      return xhr.get(this.crabUrl + this.adresUrl + capakey, {
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
      return xhr.get(this.crabUrl + this.capakeyUrl + capakey, {
        handleAs: 'customJson',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': '',
          'Content-Type': 'application/xml'
        }
      });
    },

    /**
     * Haalt de info op van kadastrale percelen in een zone op.
     * @param zone
     * @param store
     * @returns {Deferred}
     */
    getKadastralePercelenInfoInZone: function(zone, store) {
      var deferred = new Deferred();
      this.searchPerceelByZone(zone).then(lang.hitch(this, function(result) {
        var percelen = [];
        array.forEach(result, lang.hitch(this, function(coll) {
          percelen = percelen.concat(this.readWfs(coll));
        }));
        var promises = [];
        array.forEach(percelen, lang.hitch(this, function(perceel) {
          var info = this.getInfoByCapakey(perceel.get('CAPAKEY'));
          var adres = this.getAdresByCapakey(perceel.get('CAPAKEY'));
          promises.push(all({
            perceelInfo: info,
            adresInfo: adres
          }).then(lang.hitch(this, function(results) {
            var adressen = results.adresInfo.postadressen;
            if (adressen.length > 0) {
              array.forEach(adressen, lang.hitch(this, function (adres) {
                var data = {};
                var kadPerc = {};
                kadPerc.afdeling = results.perceelInfo.sectie.afdeling.naam;
                kadPerc.sectie = results.perceelInfo.sectie.id;
                kadPerc.perceel = results.perceelInfo.id;
                kadPerc.capakey = perceel.get('CAPAKEY');
                kadPerc.oppervlakte = perceel.get('OPPERVL');
                /* jshint -W106 */
                data.kadastraal_perceel = kadPerc;
                data.adres = this._parseAddressString(adres);
                data.ref_adres = false;
                data.perceeltype = { id: 1 };
                /* jshint +W106 */

                if (this.checkPerceelAlreadyExists(store, data)) {
                  store.put(data);
                  //parent.refreshGrid();
                }
              }));
            } else {
              var data = {};
              var kadPerc = {};
              kadPerc.afdeling = results.perceelInfo.sectie.afdeling.naam;
              kadPerc.sectie = results.perceelInfo.sectie.id;
              kadPerc.perceel = results.perceelInfo.id;
              kadPerc.capakey = perceel.get('CAPAKEY');
              kadPerc.oppervlakte = perceel.get('OPPERVL');

              /* jshint -W106 */
              data.kadastraal_perceel = kadPerc;
              data.adres = undefined;
              data.ref_adres = false;
              data.perceeltype = { id: 1 };
              /* jshint +W106 */
              if (this.checkPerceelAlreadyExists(store, data)) {
                store.put(data);
                //parent.refreshGrid();
              }
            }
          }), function(err) {
            console.log(err);
            deferred.reject(err);
          }));
        }));
        all(promises).then(function() {
          deferred.resolve('succes');
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
     * Haalt de kadastrale percelen op in een zone.
     * @param zone
     * @returns {Deferred}
     */
    getKadastralePercelenInZone: function(zone) {
      zone = this._bufferZone(zone, -0.0001);

      return this.searchPerceelByZone(zone).then(lang.hitch(this, function(result) {
        var percelen = [];
        array.forEach(result, function(coll) {
          percelen = percelen.concat(this.readWfs(coll));
        }, this);
        var kadPercelen = [];
        array.forEach(percelen, lang.hitch(this, function(perceel) {
          var capakey = perceel.get('CAPAKEY');
          // var niscode = perceel.get('NISCODE');
          // var opp = perceel.get('OPPERVL');
          var kadPerc = {
            capakey: capakey,
            afdelingsnummer: capakey.slice(0,5),
            sectie: capakey.slice(5,6),
            perceel: capakey.slice(6,capakey.length+1)
          };
          kadPercelen.push({
            capakey: capakey,
            perceel: kadPerc,
            perceeltype: { id: 1 }
          });
        }));
        return kadPercelen;
      }), function(err) {
        console.error('Error searching parcels:', err);
      });
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
          this.getAdresByCapakey(perceel.capakey).then(lang.hitch(this, function (results) {
            var adressen = results.postadressen;
            if (adressen.length > 0) {
              array.forEach(adressen, lang.hitch(this, function (adres) {
                var data = {};
                data.adres = this._parseAddressString(adres);
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

    updateOppervlakteExistingPercelen: function(zone, store, locatiePercelen) {
      if (zone) {
        zone = this._bufferZone(zone, -0.0001);
        this.searchPerceelByZone(zone).then(lang.hitch(this, function (result) {
          var percelen = [];
          array.forEach(result, lang.hitch(this, function (coll) {
            percelen = percelen.concat(this.readWfs(coll));
          }));
          array.forEach(percelen, lang.hitch(this, function (perceel) {
            var key = perceel.get('CAPAKEY');
            var oppPercelen = store.filter({'capakey': key}).fetchSync();
            var kadPerceel = null;
            if (oppPercelen.length > 0) {
              kadPerceel = oppPercelen[0];
            }
            if (kadPerceel) {
              /* jshint -W106 */
              kadPerceel.kadastraal_perceel.oppervlakte = perceel.get('OPPERVL');
              /* jshint +W106 */
              store.put(kadPerceel);
            }
          }));
          locatiePercelen._updatePerceelOppervlakte();
        }), function(err) {
          console.log(err);
        });
      }
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
      return xhr(this.appUrl + this.checkFlandersUrl, {
        method: 'POST',
        data: data,
        handleAs: 'customJson',
        headers: {
          'X-Requested-With': '',
          'Content-Type': 'application/json'
        }
      });
    },

    getDichtstbijzijndeAdres: function(zone) {
      var data = JSON.stringify(zone);
      return xhr(this.appUrl + this.targetNearestAddress, {
        method: 'POST',
        data: data,
        handleAs: 'json',
        headers: {
          'X-Requested-With': '',
          'Content-Type': 'application/json'
        }
      });
    },

    getAfdelingenStore: function() {
      var deferred = new Deferred();

      xhr.get(this.crabUrl + this.targetAfdelingen, {
        handleAs: 'json',
        headers:{
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }).then(
        lang.hitch(this,function(data){
          deferred.resolve(new Memory({data:data}));
        }),
        function(err){
          deferred.reject(err);
        }
      );
      return deferred;
    },

    /**
     * Geeft een store terug om gelocaties te kunnen bepalen
     * @returns {Object} De JsonRest store die de geolocation service bevraagt
     */
    getGeolocationStore: function () {
      return this._geolocationStore;
    }
  });
});