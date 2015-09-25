var gulp   				= require('gulp'),
    documentation = require('gulp-documentation');

gulp.task('doc', function () {
  gulp.src('app/scripts/project/main.js')
    .pipe(documentation({ 
    	format: 'html'
    }))
    .pipe(gulp.dest('doc'));
});