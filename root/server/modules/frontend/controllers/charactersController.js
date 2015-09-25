var controller = require('../core/Controller');

var CharactersController = function() {
  controller.call(this);
}

CharactersController.prototype = Object.create(controller.prototype);
CharactersController.prototype.constructor = CharactersController;

CharactersController.prototype.indexAction = function(req, res) {
  var params = req.params;
  res.render('characters', this.datas);
}

module.exports = new CharactersController();