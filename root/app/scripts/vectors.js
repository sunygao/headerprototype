'use strict';

/**
 * Main module - App entry point
 * @module Main
 */

var Vector = function(){
	this.$el = $('#svg_container');
	this.$triangles = $('#triangles');
	this.trianglesWidth = this.$triangles.width();
	this.strokeDashArray = this.trianglesWidth;
	this.strokeOffset = this.trianglesWidth;
	this.scale = 3;
};

Vector.prototype.initialize = function() {
	var bBox = this.$triangles[0].getBBox();
	var width = bBox.width;
	var height = bBox.height;
	var points = this.$triangles.find('polygon').attr('points');
	console.log($('test').split);
	// $.each(points, function(i, point) {
	// 	console.log(point);
	// });

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


