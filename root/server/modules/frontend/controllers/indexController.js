var controller = require('../core/Controller');

var IndexController = function() {
  controller.call(this);
}

IndexController.prototype = Object.create(controller.prototype);
IndexController.prototype.constructor = IndexController;

module.exports = new IndexController();