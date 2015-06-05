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
        }

    });

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['watch']);
};
