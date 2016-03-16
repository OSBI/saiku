module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        // Import Saiku files
        saiku: grunt.file.readJSON('saikuFilesPath.json'),
        
        // Watch definitions
        watch: {
            reload: {
                files: ['<%= saiku.path.css %>', '<%= saiku.path.html %>', '<%= saiku.path.js %>'],
                options: {
                    livereload: {
                        port: 35729
                    }
                }
            }
        },

        // CSS Comb definitions
        csscomb: {
            dist: {
                options: {
                    config: '.csscomb.json'
                },
                files: {
                    // 'css/saiku/src/styles.css': ['css/saiku/src/styles.css'],
                    'js/saiku/plugins/Dashboards/css/plugin.css': ['js/saiku/plugins/Dashboards/css/plugin.css']
                }
            }
        },

        // PostCSS definitions
        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({ browsers: 'last 2 versions' })
                ]
            },
            dist: {
                src: 'css/saiku/src/styles.css'
            }
        }        
    });

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-csscomb');
    grunt.loadNpmTasks('grunt-postcss');

    // By default, lint and run all tests
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('comb', ['csscomb']);
    // grunt.registerTask('post', ['postcss']);
};
