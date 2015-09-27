'use strict';

/**
 * Main module - App entry point
 * @module Main
 */

var Main = function(){
	this.imgList = [
 		"static/img/hands.jpg",     
	];

  this.svgList = [
  	"static/svg/circle.svg",  
  ];

  this.imgOffset = {
		x : 0,
		y : 0
	};

	this.availW = $('#header').width();
	this.availH = $('#header').outerHeight();

	this.plotted = [];
   
	this.contrast = 50;

	this.svg = null;

  this.filteredImageData = null;

  this.svgData = null;

  this.imageProcessed = false;
  this.svgProcessed = false;

  var _this = this;

  $(window).bind('svgProcessed', function() {
  	_this.svgProcessed = true;
  	_this.createComposite();
  });

	$(window).bind('imageProcessed', function() {
		_this.imageProcessed = true;	
		_this.createComposite();
  });  
};

/**
 * Callback fired once the document is ready
 * @public
 */
Main.prototype.onReady = function() {
	this.$canvas = $("#visible_canvas");
	this.$originCanvas = $("#origin_canvas");
	this.ctx = this.$canvas[0].getContext('2d');
	this.$compositeCanvas = $('#composite_canvas');
	this.originctx = $("#origin_canvas")[0].getContext('2d');
	this.compositectx = this.$compositeCanvas[0].getContext('2d');

	this.imgsrc = document.createElement('img');

	//set the size
	this.$canvas.attr('height', this.availH).attr('width', this.availW);
	this.$originCanvas.attr('height', this.availH).attr('width', this.availW);
	this.$compositeCanvas.attr('height', this.availH).attr('width', this.availW);

	var _this = this;
	this.imgsrc.addEventListener("load", function () {
		_this.drawOriginalImageToCanvas();
	}, false);

	this.imgsrc.src = this.imgList[0];

	this.svg = new Image();
	this.svg.src = this.svgList[0];
	this.svg.width = '800';
	this.svg.height = '800';

	this.svg.onload = function(){
    $(window).trigger('svgProcessed');
	}
};

Main.prototype.clearCanvas = function() {
	this.ctx.clearRect(0,0,this.availW, this.availH);
	this.originctx.clearRect(0,0,this.availW,this.availH);
};


Main.prototype.drawOriginalImageToCanvas = function() {
		// stop previous animation:
	var imgW = this.imgsrc.width,
		imgH = this.imgsrc.height,
		w = imgW,
		h = imgH,
		ratio, x,y;
	
		if( w > this.availW || h > this.availH ){
			var ratio = imgH / imgW,
			w = this.availW,
			h = ratio * w;
			if( h > this.availH ){
				console(' height too large');
				h = this.availH;
				ratio = imgW/imgH;
				w = ratio * h;
			}
		}
		ratio = this.availW/this.availH;
		w = imgW * ratio;
		h = imgH * ratio;
		x = (this.availW - w)/2;
		y = (this.availH - h)/2;
		this.imgOffset.x = x;
		this.imgOffset.y = y;
		this.imgOffset.w = w;
		this.imgOffset.h = h;

		console.log(w, h);
		this.ctx.drawImage(this.imgsrc,x,y, w, h);
		this.originctx.drawImage(this.imgsrc,x,y,w ,h );
		var imageData = this.ctx.getImageData(x,y,w,h); //get image data for image bounding box
  		var pixels = imageData.data;
  		var numPixels = pixels.length;
  		
  		//up the contrast
  		var factor = (259 * (this.contrast + 255)) / (255 * (259 - this.contrast));

  		for (var i = 0; i < numPixels; i+= 4) {
  			var average = (pixels[i] + pixels[i+1] + pixels[i+2]) /3;
  			
  			// pixels[i] = average;
     //  		pixels[i+1] = average;
     //  		pixels[i+2] = average;

  			pixels[i] = factor * (average - 128) + 128;
      		pixels[i+1] = factor * (average - 128) + 128;
      		pixels[i+2] = factor * (average - 128) + 128;
      		//pixels[i+3] = 200;
  		}
  		this.clearCanvas();
  		this.originctx.putImageData(imageData,x,y);

  		var imageDataGrayscale = this.originctx.getImageData(x,y,w,h);
  		var grayPixels = imageDataGrayscale.data;
  		var numPixelsGray = grayPixels.length;

		for (var i = 0; i < numPixelsGray; i++) {
      		var average = (pixels[i*4] + pixels[i*4+1] + pixels[i*4+2]) /3;
      		// set red green and blue pixels to the average value
      		
      		//pixels[i*4+3] = Math.abs(average - 255);

      		

      		//if(average > 127) { //lighter half of image
      			grayPixels[i*4] = 254;
      			grayPixels[i*4+1] = 96;
      			grayPixels[i*4+2] = 10;
      			grayPixels[i*4+3] = Math.abs(average - 255);
      			//grayPixels[i*4+3] =average;
      		// } else {
      		// 	grayPixels[i*4] = 254;
      		// 	grayPixels[i*4+1] = 96;
      		// 	grayPixels[i*4+2] = 10;
      		// 	grayPixels[i*4+3] = average;
      		// }

      		//254 96 10
      			
 		 }
 		this.clearCanvas();
  	this.ctx.putImageData(imageDataGrayscale,x,y);
		this.filteredImageData = this.ctx.getImageData(x,y,w,h);

  	
  	$(window).trigger('imageProcessed');
		
};

Main.prototype.createComposite = function() {

	if(!this.imageProcessed || !this.svgProcessed) {
		return;
	}

	$('canvas').hide();
	this.$compositeCanvas.show();

	this.compositectx.putImageData(this.filteredImageData, 0, 0);
	this.compositectx.globalCompositeOperation = "destination-in";

  this.compositectx.drawImage(this.svg,0,0, 800, 1000);

};


var main = new Main();

$(document).ready(main.onReady.bind(main));