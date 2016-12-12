/* jshint node:true */
module.exports = function (grunt) {

  // Load all the tasks
  grunt.loadNpmTasks('intern');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-run');

  // Configure tasks
  grunt.initConfig({
    clean: {
      report: {
        src: [ 'testreport' ]
      }
    },
    jshint: {
      all: ['./*.js', 'tests/**/*.js'],
      options: {
        jshintrc: './.jshintrc'
      }
    },
    intern: {
      options: {
        reporters: [
          {id: 'Runner', filename: 'testreport/report.html'},
          {id: 'LcovHtml', directory: 'testreport/coverage-report'}
        ],

        runType: 'runner',
        config: 'tests/intern'
      },
      local: {
        options: {
          config: 'tests/intern'
        }
      }
    },
    connect: {
      'intern': {
        options: {
          port: 9000,
          base: '.',
          keepalive: true,
          open: 'http://localhost:9000/tests/runTests.html'
        }
      },
      'test': {
        options: {
          port: 9001,
          base: 'testreport',
          keepalive: false,
          open: 'http://localhost:9001/report.html'
        }
      },
      'coverage': {
        options: {
          port: 9002,
          base: 'testreport/coverage-report/',
          keepalive: true,
          open: 'http://localhost:9002/index.html'
        }
      }
    },
    run: {
      options: {
        wait: false
      },
      chromedriver: {
        cmd: './node_modules/chromedriver/bin/chromedriver',
        args: [
          '--port=4444',
          '--url-base=wd/hub'
        ]
      }
    }
  });

  // Register tasks
  grunt.registerTask('test', [
    'run:chromedriver',
    'clean:report',
    'intern:local',
    'stop:chromedriver',
    'connect:test',
    'connect:coverage'
  ]);
  grunt.registerTask('webtest', ['connect:intern']);
  grunt.registerTask('default', [ 'jshint', 'test' ]);
};