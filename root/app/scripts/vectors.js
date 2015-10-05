'use strict';

/**
 * Main module - App entry point
 * @module Main
 */

var Vector = function(){
	this.$el = $('#header3');
	this.shapeUrl = 'static/svg/triangle.svg';
	this.$defs = $('#svg_defs svg');
	this.shapeId = 'triangles';
	this.numShapes = 1;
	this.template = $('#shape-template').html(); 
	this.imgUrl = 'static/img/hands.jpg'

	this.getShape();

	this.strokeDashArray = this.trianglesWidth;
	this.strokeOffset = this.trianglesWidth;
};

Vector.prototype.getShape = function() {

	var _this = this;
	$.get(this.shapeUrl, function(data) {
  	_this.$shape = $(data).find('polygon').attr('id', _this.shapeId);
  	_this.$shape.appendTo(_this.$defs);
  	_this.shapeWidth = _this.$shape[0].getBBox().width;
  	_this.shapeHeight = _this.$shape[0].getBBox().height;
  	_this.createShape();
	});
};

Vector.prototype.createShape = function() {
	var context = {
		id: this.shapeId + 1,
		viewBox: '0 0 ' + this.shapeWidth + ' ' + this.shapeHeight,
		defId: this.shapeId,
		imgUrl : this.imgUrl
	}
	var template = Handlebars.compile(this.template);
	var html = template(context);
	$(html).appendTo(this.$el);

	this.strokeDashArray = $('#' + context.id).width();
	this.strokeOffset = $('#' + context.id).width();

	this.initialize();
};



Vector.prototype.initialize = function() {
	var bBox = this.$triangles[0].getBBox();
	var width = bBox.width;
	var height = bBox.height;

	this.$triangles.css({ 
		'stroke-dasharray' : this.strokeDashArray,
		'stroke-dashoffset' : this.strokeOffset,
		'opacity' : 1
	});

	TweenMax.to(this, 1, {
		strokeOffset: 0,
		onUpdate: function() {
			this.$triangles.css({ 
				'stroke-dasharray' : this.strokeDashArray,
				'stroke-dashoffset' : this.strokeOffset
			});
		},
		onUpdateScope: this,
		onComplete: function() {
			this.$triangles.attr('class', 'active')
		},
		onCompleteScope: this
	});
};


