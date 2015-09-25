var express = require('express');
var routing = require('./core/Routing');

var FrontEndRouting = function() {

  routing.call(this);
  
}

FrontEndRouting.prototype = Object.create(routing.prototype);
FrontEndRouting.prototype.constructor = FrontEndRouting;

FrontEndRouting.prototype.initRoutes = function() {

  this.addRoute({
    route: '/',
    controller: 'homepage',
    action: 'index',
    type:"homepage",
    frontRouting: false
  });

  this.addRoute({
    route: '/routes.json',
    controller: 'json',
    action: 'routes',
    type:"routes",
    frontRouting: false
  });

  this.addRoute({
    route: '/:@locale/:@about',
    locale: ':@locale',
    controller: 'about',
    action: 'index',
    type: 'about'
  });

  this.addRoute({
    route: '/:@locale',
    locale: ':@locale',
    controller: 'index',
    action: 'index',
    type: 'index'
  });

  this.addRoute({
    route: '/:@locale/:@characters',
    locale: ':@locale',
    controller: 'characters',
    action: 'index',
    type: 'characters'
  });

  this.addRoute({
    route: '/:@locale/:@characters/:@character',
    locale: ':@locale',
    controller: 'character',
    action: 'index',
    type: 'character'
  });



  routing.prototype.initRoutes.call(this);
  
} 


module.exports = new FrontEndRouting();
