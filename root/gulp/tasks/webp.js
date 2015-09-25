var gulp      = require('gulp'),
    webp      = require('gulp-webp'),
    argv 			= require('yargs').argv,
    gulpif 		= require('gulp-if'),
    Utils     = require('../util/utils'),
		config   	= require('../util/utils').getConfig();

gulp.task('webp', function(cb, err){

	var isBuilding    = Utils.building();

	if(!argv.dev || isBuilding) {

		return gulp.src(config.webp.src)
				 .pipe(webp({quality:90}))
				 .pipe(gulp.dest(config.webp.dest))

	};

	return cb(err);

});