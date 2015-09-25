var gulp      = require('gulp'),
		config    = require('../util/utils').getConfig(),
    uglifyJS  = require('gulp-uglify');

gulp.task('uglify', function(cb, err) {

  return gulp.src(config.uglify.src)
	  .pipe(uglifyJS({
	  	compress: {
	      drop_console: true
	    }
	  }))
	  .pipe(gulp.dest(config.uglify.dest));

});