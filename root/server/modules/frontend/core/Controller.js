var config  = require('getconfig'),
    Routes  = require('../routes');

var controller = (function() {

  var Controller = function() {
    this.lang = 'en';
    this.locale = 'en-US';
    this.datas = {};
    this.type = null;
    this.pathDatas = (this.pathDatas != undefined) ? this.pathDatas : "/";
    this.hasLayout = (this.hasLayout != undefined) ? this.hasLayout : true;
  }

  Controller.prototype = {

    init: function(type) {
      this.type = type;
    },

    preAction: function(req, res) {
      
      this.setBaseUrl(req);
      this.setBasicDatas(req);
      this.setPageDatas(req);
      this.setHeaders(req, res);
      this.setMenu(req);

    },

    postAction: function(req, res) {
      req.setLocale(this.locale);
    },

    setBaseUrl: function(req) {

      this.locale = req.params.locale;
      this.lang   = req.params.locale.substr(0, 2 );

      var baseUrl = req.protocol + '://' + req.get('host');

      // Base url
      if (config.frontend.base_url.length) {

        if (config.frontend.base_url[0] == '/') {
          baseUrl += config.frontend.base_url[0];
        }

        if (config.frontend.base_url.indexOf('http')) {
          baseUrl = config.frontend.base_url;
        }
        
      } 
      
      // Maybe wrong here :/
      config.frontend.root =  '';

      config.frontend.base_url = baseUrl;
    },

    setBasicDatas: function(req) {

      //Reset
      this.datas = null;
      this.datas = {};

      // First, get config datas
      for (var prop in config.frontend) {
        this.datas[prop] = config.frontend[prop];
      }

      // Lang
      this.datas.lang   = this.lang;
      this.datas.locale = this.locale;

      // Is dev ?
      this.datas.use_src = config.frontend.use_src;
      
      // get device
      this.datas.device = req.device.type;
      this.datas.is_mobile = (this.datas.device == 'phone') ? true : false;

      // Menu
      this.datas.nav = Routes.aLocaleRoutes[this.datas.locale];
      
    },

    setPageDatas: function(req) {

      if (this.type == null) return;

      // get translated datas
      var translatedDatas = require(config.frontend.translationPath + this.locale + this.pathDatas + req.params.id + '.json');
      for (var prop in translatedDatas) {
        this.datas[prop] = translatedDatas[prop];
      }

      // Display layout?
      if(!this.hasLayout)
      this.datas.layout = false;

    },

    setHeaders: function(req, res) {

      var headers = req.headers['user-agent'];

      if (headers.indexOf('MSIE') > -1) {
        res.setHeader('X-UA-Compatible', 'IE=edge,chrome=1');
        this.datas.hasCompatibleMetaHeader = true;
      }
    },

    setMenu: function(req) {
      if (this.type == null) return;
    },

    getDatasAction: function(req, res) {
      
      res.setHeader('Content-Type', 'application/json');

      var datas = require(config.frontend.translationPath + this.locale + this.pathDatas + req.params.id + '.json');

       res.json(datas);
    },

    indexAction: function(req, res) {
      var params = req.params;
      console.log('indexAction', this.type);
      res.render(this.type, this.datas);
    }

  }


  return Controller;

})();

module.exports = controller;