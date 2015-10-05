'use strict';

/**
 * Main module - App entry point
 * @module Main
 */

var Shape = function(){
	this.$triangles = $('#triangles1');
	this.trianglesWidth = this.$triangles.width();
	this.strokeDashArray = this.trianglesWidth;
	this.strokeOffset = this.trianglesWidth;
	this.scale = 3;
};

Shape.prototype.initialize = function() {
	var bBox = this.$triangles[0].getBBox();
	var width = bBox.width;
	var height = bBox.height;
	var points = this.$triangles.find('polygon').attr('points');
	console.log(this.$triangles[0].getBBox());

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


