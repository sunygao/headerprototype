var gulp      			= require('gulp'),
    webpack   			= require('webpack'),
    gutil   				= require('gulp-util'),
    Utils           = require('../util/utils'),
    webpackConfig  	= require('../webpack.config'),
		config   				= require('../util/utils').getConfig();

gulp.task('webpack', function(cb, err){

  var isBuilding    = Utils.building();

  if (isBuilding) {

    webpackConfig.devtool = null;

    webpackConfig.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: false,
        mangle: false
      })
    );

    webpackConfig.output.filename = "../build/js/bundle.min.js";
    

  }
  
	// run webpack
  return webpack(webpackConfig, function(err, stats) {
      if(err) throw new gutil.PluginError("webpack", err);
      gutil.log("[webpack]", stats.toString({
          // output options
      }));
      cb();
  });



});