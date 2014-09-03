module.exports = function(grunt) {
	grunt.initConfig({

		// Autoprefixer definitions
		autoprefixer: {
			file: {
				src: 'css/saiku/src/styles.css'
			}
		}
	});

	// These plugins provide necessary tasks
	grunt.loadNpmTasks('grunt-autoprefixer');

	// By default, lint and run all tests
	grunt.registerTask('default', ['autoprefixer']);
};