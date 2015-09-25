var controller = require('../core/Controller');

var MainController = function() {
  controller.call(this);
}

MainController.prototype = Object.create(controller.prototype);
MainController.prototype.constructor = MainController;

MainController.prototype.indexAction = function(req, res) {
  var params = req.params;
  res.render('main', this.datas);
}

module.exports = new MainController();