module.exports = function(grunt) {
	'use strict';

	var saikuFiles = module.exports.saiku;
	var saikuEmbedFiles = module.exports.saikuEmbed;

	var saikuOutput = {
	  js: 'dist/saiku.js',
	  min: 'dist/saiku.min.js',
	  map: 'dist/saiku.min.js.map'
	};

	var saikuEmbedOutput = {
	  js: 'dist/saiku.embed.js',
	  min: 'dist/saiku.embed.min.js',
	  map: 'dist/saiku.embed.min.js.map'
	};


	grunt.initConfig({

		// Autoprefixer definitions
		autoprefixer: {
			file: {
				src: 'css/saiku/src/styles.css'
			}
		},
	    clean: {
	      files: ['dist']
	    },
	    concat: {
	      saiku: {
	          src: saikuFiles,
	          dest: saikuOutput.js
	      },
	      saikuEmbed: {
	          src: saikuEmbedFiles,
	          dest: saikuEmbedOutput.js
	      }
	    },
	    uglify: {
	      jsMin: {
	          options: {
	              mangle: true,
	              compress: true
	          },
	          files: [{
	            src: saikuOutput.js,
	            dest: saikuOutput.min
	          },{
	            src: saikuEmbedOutput.js,
	            dest: saikuEmbedOutput.min
	          },]
	      }
	    },
	    jshint: {
	      gruntfile: {
	        src: 'Gruntfile.js'
	      },
	      scripts: {
	        src: [saikuFiles, saikuEmbedFiles],
	        options: {
	            indent: 4
	            //,ignores: ['src/**/banner.js','src/**/footer.js']
	        }
	      }
	    },
		watch: {
	      gruntfile: {
	        files: '<%= jshint.gruntfile.src %>',
	        tasks: ['jshint:gruntfile']
	      },
	      scripts: {
	        files: '<%= jshint.scripts.src %>',
	        tasks: ['default']
	      },
	      css: {
	        files: '<%= autoprefixer.file.src %>',
	        tasks: ['autoprefixer']
	      },
	      reload: {
	          files: ['<%= autoprefixer.file.src %>', '<%= jshint.scripts.src %>'],
	          options: {
	            livereload: {
	                port: 9000
	            }
	          }
	      }
	    },

	});

	// These plugins provide necessary tasks
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-clean'); // Delete files from a directory
	grunt.loadNpmTasks('grunt-contrib-concat'); // Join multiples js files in one file
	grunt.loadNpmTasks('grunt-contrib-uglify'); // A JavaScript parser/compressor/beautifier
	grunt.loadNpmTasks('grunt-contrib-jshint'); // A tool that helps to detect errors and potential problems in your JavaScript code.
	grunt.loadNpmTasks('grunt-contrib-watch'); // Run predefined tasks whenever watched file patterns are added, changed or deleted.

	// By default, lint and run all tests
	grunt.registerTask('default', ['autoprefixer', 'jshint']);
	grunt.registerTask('build', ['default', 'clean', 'concat', 'uglify']);
};



/*module.exports.saiku = [
	"js/saiku/Settings.js",
	"js/saiku/render/SaikuRenderer.js",
	"js/saiku/render/SaikuTableRenderer.js",
	"js/saiku/render/SaikuChartRenderer.js",
	"js/saiku/views/Tab.js",
	"js/saiku/models/Dimension.js",
	"js/saiku/views/DimensionList.js",
	"js/saiku/views/Toolbar.js",
	"js/saiku/views/Modal.js",
	"js/saiku/views/MDXModal.js",
	"js/saiku/views/SelectionsModal.js",
	"js/saiku/views/DrillthroughModal.js",
	"js/saiku/views/PermissionsModal.js",
	"js/saiku/views/LoginForm.js",
	"js/saiku/views/DemoLoginForm.js",
	"js/saiku/views/AboutModal.js",
	"js/saiku/views/AddFolderModal.js",
	"js/saiku/views/FilterModal.js",
	"js/saiku/views/CustomFilterModal.js",
	"js/saiku/views/QueryToolbar.js",
	"js/saiku/views/WorkspaceToolbar.js",
	"js/saiku/views/WorkspaceDropZone.js",
	"js/saiku/views/Table.js",
	"js/saiku/views/Workspace.js",
	"js/saiku/views/DeleteRepositoryObject.js",
	"js/saiku/views/OpenQuery.js",
	"js/saiku/views/SaveQuery.js",
	"js/saiku/views/OpenDialog.js",
	"js/saiku/models/Repository.js",
	"js/saiku/models/Result.js",
	"js/saiku/models/QueryAction.js",
	"js/saiku/models/QueryScenario.js",
	"js/saiku/models/Query.js",
	"js/saiku/models/Session.js",
	"js/saiku/models/SessionWorkspace.js",
	"js/saiku/models/Member.js",
	"js/saiku/Saiku.js",
	"js/saiku/adapters/SaikuServer.js",
	"js/saiku/routers/QueryRouter.js",
	"js/saiku/plugins/Statistics/plugin_disabled.js",
	"js/saiku/plugins/I18n/plugin_disabled.js",
	"js/saiku/plugins/BIServer/plugin_disabled.js",
	"js/saiku/plugins/Buckets/plugin_disabled.js",
	"js/saiku/plugins/CCC_Chart/plugin_disabled.js"
];*/


module.exports.saiku = [
	"js/saiku/Settings.js",
	"js/saiku/models/SaikuOlapQuery.js",
	"js/saiku/render/SaikuRenderer.js",
	"js/saiku/render/SaikuTableRenderer.js",
	"js/saiku/render/SaikuChartRenderer.js",
	"js/saiku/models/Dimension.js",
	"js/saiku/views/DimensionList.js",
	"js/saiku/views/Toolbar.js",
	"js/saiku/views/Upgrade.js",
	"js/saiku/views/Modal.js",
	"js/saiku/views/MDXModal.js",
	"js/saiku/views/SelectionsModal.js",
	"js/saiku/views/DrillthroughModal.js",
	"js/saiku/views/PermissionsModal.js",
	"js/saiku/views/DemoLoginForm.js",
	"js/saiku/views/LoginForm.js",
	"js/saiku/views/AboutModal.js",
	"js/saiku/views/AddFolderModal.js",
	"js/saiku/views/FilterModal.js",
	"js/saiku/views/CustomFilterModal.js",
	"js/saiku/views/MeasuresModal.js",
	"js/saiku/views/QueryToolbar.js",
	"js/saiku/views/WorkspaceToolbar.js",
	"js/saiku/views/WorkspaceDropZone.js",
	"js/saiku/views/Table.js",
	"js/saiku/views/Workspace.js",
	"js/saiku/views/DeleteRepositoryObject.js",
	"js/saiku/views/OpenQuery.js",
	"js/saiku/views/SaveQuery.js",
	"js/saiku/views/OpenDialog.js",
	"js/saiku/views/Tab.js",
	"js/saiku/models/Repository.js",
	"js/saiku/models/Result.js",
	"js/saiku/models/QueryAction.js",
	"js/saiku/models/QueryScenario.js",
	"js/saiku/models/Query.js",
	"js/saiku/models/Session.js",
	"js/saiku/views/SplashScreen.js",
	"js/saiku/models/SessionWorkspace.js",
	"js/saiku/models/Member.js",
	"js/saiku/models/Plugin.js",
	"js/saiku/models/License.js",
	"js/saiku/Saiku.js",
	"js/saiku/adapters/SaikuServer.js",
	"js/saiku/routers/QueryRouter.js"
];


module.exports.saikuEmbed = [
	"js/saiku/Settings.js",
	"js/saiku/render/SaikuRenderer.js",
	"js/saiku/render/SaikuTableRenderer.js",
	"js/saiku/render/SaikuChartRenderer.js",
	"js/saiku/embed/SaikuEmbed.js"
];	