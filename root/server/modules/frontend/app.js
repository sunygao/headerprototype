var path        = require('path'),
    onlyScripts = require('../../util/scriptFilter');
    //pages       = require('./datas/pages').pages,
    routes      = require('./routes'),
    express     = require('express'),
    config      = require('getconfig'),
    i18n        = require('i18n'),
    exphbs      = require('express-handlebars'),
    fs          = require('fs');

var FrontEndModule = function() {

  this.app = null;
  this.aControllers = {};

  _initConfig.call(this);

}

FrontEndModule.prototype = {

  init: function(app) {

    this.app = app;

    initLocales_.call(this);
    initEnv_.call(this);
    initControllers_.call(this);
    initViews_.call(this);
    initRoutes_.call(this);
    
  }

}

var _initConfig = function() {

  config.frontend.translationPath = __dirname + '/datas/translations/';
  config.frontend.baseLanguage    = "en";
  config.frontend.baseLocale      = "en-US";
  config.frontend.tplPath = global.APP.basePath + '/tpl';
  config.frontend.tplLayoutPath = config.frontend.tplPath + '/layout';
  config.frontend.tplPartialPath = config.frontend.tplPath + '/partial';

}

var initLocales_ = function() {

  var locales = fs.readdirSync(config.frontend.translationPath);
  var self = this;

  config.frontend.aLocale = [];

  locales.forEach(function(locale) {
    config.frontend.aLocale.push(locale);
  });

}

var initEnv_ = function() {

  i18n.configure({locales:config.frontend.aLocale})
  this.app.use(i18n.init);

  // Error
  if (config.frontend.display_error) {
    this.app.enable('verbose errors');  
  } else {
    this.app.disable('verbose errors');  
  }

  // Base url
  if (config.frontend.base_url === undefined) {
    config.frontend.base_url = "";
  }

}

var initControllers_ = function() {

  var controllers = fs.readdirSync(__dirname + '/controllers/').filter(onlyScripts.file); //Filter out DS_STORE files for instance
  var self = this;

  controllers.forEach(function(ctrl) {

    var controller = require('./controllers/' + ctrl);

    // Is a page? 
    var pageType = ctrl.replace('Controller.js', '');

    /*
    var page = null;
    for (var i in pages) {

      var p = pages[i];

      if(p.id === pageId) {
        page = p;
        break;
      }
    }
    */

    controller.init(pageType);

    self.aControllers[pageType] = controller;

  });


}

var initViews_ = function() {

  //this.app.set('views', path.join(__dirname, 'views'));
  this.app.set('views', config.frontend.tplPath);
  this.app.set('view engine', 'html');

  //this.app.engine('html', dot.__express);
  this.app.engine('html', exphbs({defaultLayout: config.frontend.tplLayoutPath + '/layout.html'}));

  // Device detection
  this.app.use(require('express-device').capture());

  // Static assets
  this.app.use(express.static(__dirname + '/../../..' + config.frontend.folder));
}

var initRoutes_ = function() {

  // Init the routes
  routes.init();

  // Set the controllers
  for (var i in routes.aRoutes) {

    var route = routes.aRoutes[i];

    // ID controller tho
    route.controller = (route.controller != undefined ) ? route.controller : "index";
    route.action = (route.action != undefined ) ? route.action : "index";

    var controller = this.aControllers[route.controller];

    if (controller === undefined) {
      throw new Error('The specified controller "'+ route.controller + 'Controller" doesn\'t exist');
    }

    route.ctrl = controller;

  }

  // Setup the routes
  routes.setupRoutes();

  // Finally, setup the router
  this.app.use(routes.router);

  // Since this is the last non-error-handling
  // middleware use()d, we assume 404, as nothing else
  // responded.
  // 404
  this.app.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
      res.render('404', { url: req.url });
      return;
    }

    // respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Not found' });
      return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
  });


  // error-handling middleware, take the same form
  // as regular middleware, however they require an
  // arity of 4, aka the signature (err, req, res, next).
  // when connect has an error, it will invoke ONLY error-handling
  // middleware.

  // If we were to next() here any remaining non-error-handling
  // middleware would then be executed, or if we next(err) to
  // continue passing the error, only error-handling middleware
  // would remain being executed, however here
  // we simply respond with an error page.

  this.app.use(function(err, req, res, next){
    // we may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().

    console.log('err', err);
    //console.log('req', req);
    res.status(err.status || 500);
    res.render('500', { error: err });
  });

}



module.exports = new FrontEndModule();