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
    { name: 'olv319', location: '../olv319', main: 'ol-debug' }
  ]
};