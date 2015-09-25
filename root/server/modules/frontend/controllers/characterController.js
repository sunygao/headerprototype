var controller = require('../core/Controller');

var CharacterController = function() {
	this.pathDatas = "/characters/";
  controller.call(this);
}

CharacterController.prototype = Object.create(controller.prototype);
CharacterController.prototype.constructor = CharacterController;

CharacterController.prototype.indexAction = function(req, res) {
  var params = req.params;
  res.render('characters/character', this.datas);
}

module.exports = new CharacterController();