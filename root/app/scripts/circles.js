'use strict';

/**
 * Main module - App entry point
 * @module Main
 */

var Main = function(){
	this.clientID = 'fa0430c5074f49ccaa3830a3c8486133';
	this.clientSecret = '732ca02b41884bafb5a36c2c363f0608';

	this.svg = Snap('#svg');

	this.shapeType = 'circles';

	this.headerWidth = $('#header').width();
	this.headerWidth = $('#header').height();

	this.shapes = [ ];

	this.boundaries = { };

 
};

/**
 * Callback fired once the document is ready
 * @public
 */
Main.prototype.onReady = function() {
	//this.createShapes();
	

	//this.loadCircle();
	//var circles = this.svg.group(bigCircle, smallCircle);
};
Main.prototype.loadCircle = function() {
	var _this = this;

	var circlesLoaded = Math.floor((Math.random() * 10) + 5);

	for (var i = 0; i <= circlesLoaded; i++) { 
    
		Snap.load("static/svg/circle.svg", function (f) {
			var scale = i/2;

			var g = f.select("g");
			var t = new Snap.Matrix()
			t.scale(scale, scale);
			g.transform(t); 
			//g.transform('s'+ scale + ',' + scale);
			_this.svg.append(g);
			i++;
		});
		
	}
	
// W
};
Main.prototype.createShapes = function() {
	//var bigCircle = this.createCircle(50, 100, 50, '#FFCDD2');
	//var smallCircle = this.createCircle(90, 35, 30, '#1E3264');

	this.bigCircle = this.createCircle(50, 100, 50, '#FFCDD2', 'bigCircle');
	this.smallCircle = this.createCircle(90, 35, 30, '#1E3264', 'smallCircle');
	this.circles = this.svg.group(this.smallCircle, this.bigCircle);
	this.circles.attr({
		id: 'circles'
	});

	//random scale
	//random rotation
	//random x and y based on scale and rotation
	var randomScale = (Math.random() * 5) + 1;
	var randomRotation = (Math.random() * 300) + 1;
	
	TweenMax.set('#circles', {
		transformOrigin:'50% 50%',
		scale: (Math.random() * 5) + 3,
		rotation: randomRotation + 'deg'
	});

	var width = this.svg.getBBox().width;
	var height = this.svg.getBBox().height;
	var orientation;

	var leftBoundary = -(width/2);
	var rightBoundary = this.headerWidth;
	var topBoundary = -(height/2);
	var bottomBoundary = this.headerHeight;


	//random x between 0 - half of svg width and header with + half of svg width
	var randomX = (Math.random() * rightBoundary) + leftBoundary;
	var randomY = (Math.random() * bottomBoundary) + topBoundary
	TweenMax.set('#circles', {
		transformOrigin:'50% 50%',
		x: randomX,
		y: randomY
	});



	this.animateIn();
};

Main.prototype.createCircle = function(x, y, r, fill, id) {
	var circle = this.svg.circle(x, y, r);

	circle.attr({
		fill: fill,
		id: id
	});
	
	return circle;
};

Main.prototype.animateIn = function() {

};





var main = new Main();

$(document).ready(main.onReady.bind(main));