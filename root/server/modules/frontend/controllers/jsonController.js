var controller  = require('../core/Controller'),
    config      = require('getconfig'),
    Routes      = require('../routes');

var JsonController = function() {
  controller.call(this);
}

JsonController.prototype = Object.create(controller.prototype);
JsonController.prototype.constructor = JsonController;

JsonController.prototype.preAction = function(req, res) {
  this.setBaseUrl(req);
  this.setBasicDatas(req);
  res.setHeader('Content-Type', 'application/json');
}

JsonController.prototype.routesAction = function(req, res) {

  var routes = {};

  //for (var locale in Routes.aLocaleRoutes) {
  for (var i in config.frontend.aLocale) {

    var locale = config.frontend.aLocale[i];

    var aLocaleRoutes = Routes.aLocaleRoutes[locale];
    
    routes[locale] = [];

    for ( var i in aLocaleRoutes) {

      var route = aLocaleRoutes[i];

      if (route.frontRouting == undefined || !route.frontRouting) continue;

      //console.log('route', route);

      routes[locale].push(route);

      /*
      routes[locale][route.id] = {};

      // Copying properties
      for (var property in route) {
        routes[locale][route.id][property] = route[property];
      }

      // Complete the datas
      if (routes[locale][route.id].datas != undefined) {
        routes[locale][route.id].datas.locale = locale;
        routes[locale][route.id].datas.base_url = config.frontend.base_url;
      }

      // remove locale from route

      if (route.route != undefined) {
        var backboneRoute = route.route.replace('/' + locale + '/', '');

        //remove last slash
        if (backboneRoute[backboneRoute.length - 1] == '/') backboneRoute = backboneRoute.substr(0, backboneRoute.length - 1);
        if (backboneRoute == '/' + locale || backboneRoute == '') continue;
      }

      */
      

    }

  }

  res.json(routes);

}


module.exports = new JsonController();