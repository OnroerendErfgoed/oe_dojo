/*jshint node:true*/
module.exports = function (grunt) {

  // Load all the tasks
  grunt.loadNpmTasks('intern');
  grunt.loadNpmTasks('grunt-contrib-jshint');

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
    }
  });


  // Register tasks
  grunt.registerTask('test', [ 'jshint', 'intern' ]);
  grunt.registerTask('default', [ 'test' ]);
};