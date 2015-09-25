var gulp          = require('gulp'),
		Utils         = require('../util/utils'),
    config        = Utils.getConfig(),
    livereload    = require('gulp-livereload');

gulp.task('watch', function () {

	var config = Utils.getConfig();
	
	// set gutil env watching to true.
	Utils.watching(true);  

//  livereload.listen();
  
  gulp.watch(config.watch.stylus.src, ['stylus']);
 // gulp.watch(config.watch.vendor.src, ['concatLib']);
 // gulp.watch(config.watch.js.src, ['webpack']);
// gulp.watch(config.watch.tpl.src, ['webpack']);

  //gulp.start('webpack');
  
});
