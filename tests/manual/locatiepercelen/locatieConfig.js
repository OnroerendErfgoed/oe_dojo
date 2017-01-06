/*jshint unused:false */
var dojoConfig = {
  async: 1,
  cacheBust: 0,
  'routing-map': {
    pathPrefix: '',
    layers: {}
  },
  packages: [
    { name: 'jsts', location: '../jsts' },
    { name: 'oe_dojo', location: '..' },
    { name: 'proj4', location: '../proj4', main: 'dist/proj4' },
    { name: 'olv319', location: '../olv319', main: 'ol-debug' }
  ]
};