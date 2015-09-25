var gulp 			  = require('gulp'),
	runSequence 	= require('run-sequence'),
	argv 			    = require('yargs').argv,
	Utils         = require('../util/utils'),
	gutil  			  = require('gulp-util');

gulp.task('build', function(cb){

	// simple build = no imgmin
	var aCompress=  ['minify', 'uglify'];

	Utils.building(true);  
	
	if (!argv.dev)
		aCompress.push('imgmin')

	runSequence('cleanDist','work', 'iconfonts','copy', 
		aCompress,
		'concatProject',
    cb);

});