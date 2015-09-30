'use strict';

/**
 * Main module - App entry point
 * @module Main
 */

var VectorTest = function(){

	this.$el = $('#header2');
	this.availW = this.$el.width();
	this.availH = this.$el.outerHeight();
	this.$paperCanvas = $('#vector_canvas');
	this.shape = null;
};

/**
 * Callback fired once the document is ready
 * @public
 */
VectorTest.prototype.initialize = function() {
	this.paperctx = this.$paperCanvas[0].getContext('2d');
	
	this.$paperCanvas.attr('height', this.availH).attr('width', this.availW);

	paper.install(window);

	paper.setup('vector_canvas');

	var _this = this;

	this.shape = project.importSVG('static/svg/triangle.svg', {
		expandShapes : true,
		onLoad: function(item) {
			_this.shape = item;
			_this.positionShape();
		}
	});	
};

VectorTest.prototype.positionShape = function() {
	this.shape.fillColor = 'rgb(254, 91, 10)';
	this.shape.shadowColor = new Color(0, 0, 0);
 
   	this.shape.shadowBlur = 12;
   
   	this.shape.shadowOffset = new Point(5, 5);
};

