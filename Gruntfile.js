/*jshint node:true*/
module.exports = function (grunt) {

  // Load all the tasks
  grunt.loadNpmTasks('intern');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-http-server');

  // Configure tasks
  grunt.initConfig({
    intern: {
      dev: {
        options: {
          runType: 'client',
          config: 'tests/intern',
          reporters: [ 'Console' ]
        }
      }
    },
    jshint: {
      all: ['./*.js', 'widgets/**/*.js'],
      options: {
        jshintrc: './.jshintrc'
      }
    },
    'http-server': {
      dev: {
        root: '.',
        host: '0.0.0.0',
        port: 8000,
        showDir: true,
        runInBackground: false,
        openBrowser: true
      }
    }
  });


  // Register tasks
  grunt.registerTask('test', [ 'jshint', 'intern' ]);
  grunt.registerTask('default', [ 'test' ]);
  grunt.registerTask('run', ['http-server:dev']);
};