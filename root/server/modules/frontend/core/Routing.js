var express = require('express'),
    config  = require('getconfig'),
    _       = require('underscore'),
    fs      = require('fs');

var Routing = function() {

  this.router  = express.Router();
  this.aRoutes = [];

  this.translationRouteFile = '_slug.json';

  this.aLocale = [];
  this.aLocaleRoutes = {};

}

Routing.prototype = {

  init: function() {

    this.initRoutes();
    this.initPreMiddlewares();
    this.initPostMiddlewares();

  },

  /* To override */
  initPreMiddlewares: function() {

  },

  /* To override */
  initRoutes: function() {

    // Add the main rotues here
    this.addRoute({
      route: '/:@locale/main',
      locale: ':@locale',
      controller: 'main',
      action: 'index',
      type: 'main',
      frontRouting: true
    })

  },

  /* To override */
  initPostMiddlewares: function() {

  },

  getRouteByType: function(type) {

    for (var i in this.aRoutes) {

      var route = this.aRoutes[i];

      if (route.type == type) return route;
    }

    return null;
  },

  addRoutes: function(routes) {
    for (var i in routes) {
      this.addRoute(routes[i]);
    }
  },

  addRoute: function(routeObject) {
    this.aRoutes.push(routeObject);
  },

  setupRoutes: function() {

    // Routes

    // creates arrays
    for (var j in config.frontend.aLocale) {

      var locale = config.frontend.aLocale[j];
      this.aLocaleRoutes[locale] = [];
      
    }

    // Only the one no going in the front routes here
    for (var i in this.aRoutes) {

      var route = this.aRoutes[i];

      if (route.frontRouting == undefined || route.frontRouting == true || route.type == "main") continue;

      // Handle the multilangue here
      if (route.locale !== undefined && route.route.indexOf(route.locale) !== -1) {

        for (var j in config.frontend.aLocale) {

          var locale = config.frontend.aLocale[j];
          var rt = this.getSetupRoute({
            route:route, 
            locale:locale
          });

          //this.aLocaleRoutes[locale].push(rt);
          //this.addExpressRoute(rt, route, locale);

        }

      }
      else {

        // No mutilangue in URL, use base language and put in the params
        var rt = this.getSetupRoute({
          route: route, 
          locale:config.frontend.baseLocale
        });

        //this.aLocaleRoutes[rt.id] = rt;
        //this.addExpressRoute(rt, route, config.frontend.baseLocale);

      }
     
    }

    var mainRoute = this.getRouteByType('main');

    // Now, special case for the front routing
    for (var j in config.frontend.aLocale) {

      var locale = config.frontend.aLocale[j];
      var pages = require('../datas/translations/'+ locale +'/pages.json');

      this.getSetupRoute({
        route: mainRoute, 
        locale: locale, 
        pages: pages
      });

      
      //this.aLocaleRoutes[locale].push(rt, locale);
      //this.addExpressRoute(rt, mainRoute, locale);
    }

    //console.log('this.aLocaleRoutes', this.aLocaleRoutes);

  },

  getSetupRoute: function(config_) {

    var route = (config_.route != undefined) ? config_.route : null;
    var locale = (config_.locale != undefined) ? config_.locale : null;
    var pages = (config_.pages != undefined) ? config_.pages : null;
    //var isLevelOne = (config_.isLevelOne != undefined) ? config_.isLevelOne : true;
    var parent = (config_.parent != undefined) ? config_.parent : null;
    var id = (config_.id != undefined) ? config_.id : null;

    //console.log('pages', pages);
    
    var currentPages = null;

    if (id != null)
      currentPages = _getPageByID.call(this, id, pages);
    else
      currentPages = _getPagesByType.call(this, route.type, pages);

    // if route.id
    if (Object.prototype.toString.call(currentPages) != "[object Array]")
      currentPages = [currentPages];

    
    // /console.log('currentPages', route.type, currentPages);

    for (var i in currentPages) {

      var currentPage = currentPages[i];

      var url = _getUrl.call(this, route, locale, currentPage.id);
      //console.log('current url', url);

      if (parent != null) {
        //console.log('this parent:', parent.id);
      }

      //console.log('currentPage', currentPage);

      var rt = {
        route: url,
        id: (currentPage.id != undefined) ? currentPage.id : route.type,
        label: _getLabel.call(this, locale, currentPage.id, locale + "/" + route.ctrl.pathDatas + currentPage.id),
        datas: _getDatas.call(this, url)
      };

      if (pages != undefined) {

        rt.parentId     = (currentPage.parentId != undefined) ? currentPage.parentId : "main";
        rt.type         = (currentPage.type != undefined) ? currentPage.type : route.type;
        rt.index        = (currentPage.index != undefined) ? currentPage.index : 0;
        rt.isLoaded     = false;
        rt.frontRouting = route.frontRouting;

        rt.children = [];

        // children?
        if (currentPage.children != undefined && currentPage.children.length) {

          for (var i in currentPage.children) {

            var child = currentPage.children[i];
            var childRoute = this.getRouteByType(child.type);

            //console.log('>>', currentPage.id, 'has a child:', child.id);

            this.getSetupRoute({
              route: childRoute, 
              locale: locale, 
              pages: currentPage.children,
              id: child.id,
              parent:rt
            });

            //this.addExpressRoute(rtChild, childRoute, locale);
            //if (arrayPush != null)
            //  arrayPush.push(rtChild);
            //else

            // to push to the ancestor children array
            /*
            if (parent != null) {

              console.log('--push', rt.id , ' to is parent', parent.id);
              //console.log('--rt', rt);
              //console.log('--arrayPush', arrayPush);
              parent.children.push(rt);
            }
            */
              

          }
          

        }
        
        // not from a child, level one
        if (parent == null)
          this.aLocaleRoutes[locale].push(rt);
        else
          parent.children.push(rt);


      } else {

        // not from a child, level one
        if (parent == null) 
          this.aLocaleRoutes[rt.id] = rt;

      }

      this.addExpressRoute(rt, route, locale);

      _mergeConfig.call(this, rt, currentPage.id, locale);

    }

    
    /*
    if (pages != undefined) {

      var currentPage = _getPageByID.call(this, route.ctrl.type, pages);

      

      

    }
    */

    

    return rt;


  },

  addExpressRoute: function(rt, route, locale) {

    //console.log('route', route.ctrl);
    var actionMethod = route.action + "Action";

    //console.log('addExpressRoute', rt);

    // Finally, add a new route
    this.router.get(rt.route, function(req, res) {

      req.params.locale = locale;
      req.params.id = rt.id;

      route.ctrl.preAction(req, res);
      route.ctrl[actionMethod](req, res); // Ugly though.
      route.ctrl.postAction(req, res);

    });

    // json version, get the datas

    if (rt.route.indexOf('.json') === -1) {

      //console.log('addExpressRoute id', rt.id);

      this.router.get(rt.route + ".json", function(req, res) {

        req.params.locale = locale;
        req.params.id = rt.id;

        route.ctrl.preAction(req, res);
        route.ctrl.getDatasAction(req, res);
        route.ctrl.postAction(req, res);

      });

    }
    

  }


}

var _getUrl = function(route_, locale_, id_) {

  // Lang
  var url = route_.route.replace(':@locale', locale_);

  // Has params to translate ?
  var re = /(:@+[a-zA-Z])\w+/g;
  var aTranslateWord = url.match(re);

  if (aTranslateWord != null) {

    //console.log('aTranslateWord', aTranslateWord);

    // Replace url
    for (var i in aTranslateWord) {

      var word = aTranslateWord[i].replace(':@', '');

      //get translation
      var tWord = _getTranslation.call(this, route_.ctrl.pathDatas, id_, locale_, word);
      url = url.replace(aTranslateWord[i], tWord);

      // last one
      //if (i == aTranslateWord.length - 1) {
      //  route_.slug = tWord;
      //}

    }

  } //else {
    //route_.slug = url.replace('/', '');
 // }

  // remove slash at the end in case
  if (url[url.length-1] == "/")
    url = url.substr(0, url.length - 1);

  return url;

}

var _mergeConfig = function(rt_, id_, locale_) {

  var pages = require('../datas/translations/'+ locale_ +'/pages.json');
  var configPage = _getPageByID.call(this, id_, pages);

  for (var property in configPage) {

    if (!rt_.hasOwnProperty(property)) {
      rt_[property] = configPage[property];
    }

  }

}


var _getPageByID = function(id_, pages_){

  var page_ = null;

  for (var i in pages_) {

    var page = pages_[i];

    if (page.id == id_) {
      page_ = page;
      break;
    }

    // Haven't found anything, and has children 
    if (page.children != undefined && page_ == null) {
      page_ = _getPageByID.call(this, id_, page.children);
    }
    
  }

  return page_;

}

var _getPagesByType = function(type_, pages_){

  var aPages_ = [];

  for (var i in pages_) {

    var page = pages_[i];

    if (page.type == type_) {
      aPages_.push(page);
    }

    // Haven't found anything, and has children 
    if (page.children != undefined && !aPages_.length) {
      aPages_ = _.union(aPages_, _getPagesByType.call(this, type_, page.children));
    }
    
  }

  // Homepage, routes.json.. No pages
  if (pages_ == null) {
    aPages_.push({
      id: type_
    })
  }

  return aPages_;

}



var _getTranslation = function(pathDatas, id, locale, word) {
  //return word;
  var page = require(config.frontend.translationPath + locale + pathDatas + id + ".json");
  return (page.slug[word] !== undefined) ? page.slug[word] : word;
}

var _getDatas = function(url) {

  return url + '.json';

}

var _getLabel = function(locale, id, url) {

  var datas = url + ".json";

  if (datas.substr(0, 1) == "/")
    datas = datas.substr(1);

  var pathDatas = config.frontend.translationPath + datas;

  if (fs.existsSync(pathDatas)) {

    var translateObj = require(pathDatas);

    return (translateObj.label !== undefined) ? translateObj.label : id;

  }
  else{
    return id;
  }

  
}


module.exports = Routing;