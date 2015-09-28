'use strict';

/**
 * Main module - App entry point
 * @module Main
 */

var Main = function(){
	this.imgList = [
 		"static/img/hands.jpg",  
 		"static/img/lana.jpg", 
 		"static/img/couple.jpg", 
 		"static/img/party.jpg"
	];

  this.svgList = [
  	"static/svg/circle.svg",  
  	"static/svg/rectangle.svg",  
  	 "static/svg/triangle.svg" 
  ];

  this.colorPairs = [
  	{
  		color1: [254, 91, 10],
  		color2: [255, 202, 251]
  	},
  	{
  		color1: [58, 112, 221],
  		color2: [245, 232, 211]
  	},
  	{
  		color1: [37, 145, 11],
  		color2: [236, 227, 164]
  	},
  	{
  		color1: [168, 124, 241],
  		color2: [242, 148, 148]
  	},
  	{
  		color1: [241, 124, 231],
  		color2: [211, 245, 231]
  	}

  ];

  this.imgOffset = {
  	x: 0,
  	y: 0,
  	w: 0,
  	h: 0
  };

 // Math.random() * (max - min) + min
 	//var randomW = (Math.random() * (1.5 - .7) + .7);
 	//var randomH = (Math.random() * (1.2 - .5) + .5);
	
	this.availW = $('#header').width();
	this.availH = $('#header').outerHeight();

	this.contrast = 50;
		
	this.svg = null;

  this.filteredImageData = null;

  this.svgData = null;

  this.imageProcessed = false;
  this.svgProcessed = false;

  this.imgWidth = 0;
  this.imgHeight = 0;
  this.imageOrientation = null;

  this.svgWidth = 0;
  this.svgHeight = 0;
};

/**
 * Callback fired once the document is ready
 * @public
 */
Main.prototype.onReady = function() {
	this.getCanvases();

	this.getRandomItems();

	this.createImage();
};

Main.prototype.getCanvases = function() {
	this.$originCanvas = $("#origin_canvas");
	this.$compositeCanvas = $('#composite_canvas');
	this.$svgCanvas = $('#svg_canvas');
	this.originctx = this.$originCanvas[0].getContext('2d');
	this.compositectx = this.$compositeCanvas[0].getContext('2d');
	this.svgctx = this.$svgCanvas[0].getContext('2d');
	this.$originCanvas.attr('height', this.availH).attr('width', this.availW);
	this.$svgCanvas.attr('height', this.availH).attr('width', this.availW);
	this.$compositeCanvas.attr('height', this.availH).attr('width', this.availW);
};

Main.prototype.getRandomItems = function() {
	this.randomColor =  this.colorPairs[Math.floor(Math.random() * this.colorPairs.length)];
	this.randomImage =  this.imgList[Math.floor(Math.random() * this.imgList.length)];
	this.randomSvg =  this.svgList[Math.floor(Math.random() * this.svgList.length)];
};

Main.prototype.createImage = function() {
	this.imgsrc = document.createElement('img');
	this.imgsrc.src = this.randomImage;
	
	var _this = this;
	this.imgsrc.addEventListener("load", function () {
		_this.drawOriginalImageToCanvas();
	}, false);

};

Main.prototype.createSvg = function() {
	this.svg = new Image();
	this.svg.src = this.randomSvg;
	
	var _this = this;

	this.svg.onload = function() {
		_this.svgWidth = _this.svg.width;
		_this.svgHeight = _this.svg.height;

		var x, y, w, h, ratio;

		w = _this.imgWidth;
		h = _this.svg.height * w / _this.svg.width;
		x = 0;
		y = 0;
		
		_this.svgWidth = w;
		_this.svgHeight = h;

		_this.svgctx.drawImage(_this.svg, x, y, w, h);

		_this.createComposite();
	}
};

Main.prototype.clearCanvas = function() {
	this.originctx.clearRect(0,0,this.availW,this.availH);
};

Main.prototype.drawOriginalImageToCanvas = function() {
		var imgWidth = this.imgsrc.width;
		var imgHeight = this.imgsrc.height;
		
		var w, h, ratio, x,y;
		
		ratio = this.availW/this.availH;

		//size the image to a random width
		var randomW = (Math.random() * (.9 - .7) + .7);

		w = this.availW * randomW;
		h = imgHeight * w / imgWidth;

		if(w > h) {
			this.imageRatio = 'landscape';
		} else if(h > w) {
			this.imageRatio = 'portrait';
		} else if(h == w) {
			this.imageRatio = 'square';
		}
		// x = (this.availW - w)/2;
		x = 0;
		y = 0;
		this.imgOffset.x = x;
		this.imgOffset.y = y;
		this.imgWidth = w;
		this.imgHeight = h;

		//set size of the canvases to be the size of the image
		this.$originCanvas.attr('height', h).attr('width', w);
		this.$svgCanvas.attr('height', h).attr('width', w);
		//this.$compositeCanvas.attr('height', h).attr('width', w);

		//draw the image onto the origin canvas
		this.originctx.drawImage(this.imgsrc, x, y, w,h);

		//get the image data
		var imageData = this.originctx.getImageData(x,y,w,h); 
  	var pixels = imageData.data;
  	var numPixels = pixels.length;
  		
		//formula for upping the contrast
		var factor = (259 * (this.contrast + 255)) / (255 * (259 - this.contrast));

		//turn the image to black and white, and bump up the contrast
		for (var i = 0; i < numPixels; i+= 4) {
			var average = (pixels[i] + pixels[i+1] + pixels[i+2]) /3;
			pixels[i] = factor * (average - 128) + 128;
    	pixels[i+1] = factor * (average - 128) + 128;
    	pixels[i+2] = factor * (average - 128) + 128;
		}

		this.clearCanvas();

		//black and white image
		this.originctx.putImageData(imageData,x,y);

		var imageDataGrayscale = this.originctx.getImageData(x,y,w,h);
		var grayPixels = imageDataGrayscale.data;
		var numPixelsGray = grayPixels.length;

		//colorize the black and white photo
		for (var i = 0; i < numPixelsGray; i++) {
  		var average = (pixels[i*4] + pixels[i*4+1] + pixels[i*4+2]) /3;		
	    grayPixels[i*4] = this.randomColor.color1[0];
	    grayPixels[i*4+1] = this.randomColor.color1[1];
	    grayPixels[i*4+2] =  this.randomColor.color1[2];
	    grayPixels[i*4+3] = Math.abs(average - 255);
		}

		this.clearCanvas();

		this.originctx.putImageData(imageDataGrayscale,x,y);

		//get image data of the colorized image
		this.filteredImageData = this.originctx.getImageData(0,0, w,h);

		//create the svg canvas
		this.createSvg();
};

Main.prototype.createComposite = function() {

	$('canvas').hide();

	var colorString = 'rgba(' + this.randomColor.color2[0] + ', ' + this.randomColor.color2[1] + ', ' +  this.randomColor.color2[2] + ', .8)';
	
	$('#header').css('background-color', colorString);

	this.$compositeCanvas.show();
	var min = -(this.svgWidth/2);
	var max = this.availW - (this.svgWidth/2);
	var randomX = Math.random() * (max - min) + min;

	this.compositectx.putImageData(this.filteredImageData, randomX, (this.availH - this.imgHeight) / 2);

	this.compositectx.globalCompositeOperation = "destination-in";
	
	this.compositectx.drawImage(this.svg, randomX, (this.availH - this.svgHeight) /2, this.svgWidth, this.svgHeight);

};


var main = new Main();

$(document).ready(main.onReady.bind(main));