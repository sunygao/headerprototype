var gulp      = require('gulp'),
		plumber 	= require('gulp-plumber'),
		config 		= require('../util/utils').getConfig(),
    concatJS  = require('gulp-concat');

gulp.task('concatProject', function(cb, err) {

	// Might want to concat them IN A SPECIFIC ORDER
  return gulp.src(config.concatProject.src)
	  .pipe(plumber())
	  .pipe(concatJS(config.concatProject.filename))
	  .pipe(gulp.dest(config.concatProject.dest));

});