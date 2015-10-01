'use strict';

var PhotoMask = function(){
	this.imgList = Config.imgList;

 	this.svgList = Config.svgList;

  this.colorPairs = Config.colorPairs;

  this.imgOffset = {
  	x: 0,
  	y: 0,
  	w: 0,
  	h: 0
  };

  this.availW = $('#header').width();
	this.availH = $('#header').outerHeight();

	this.contrast = 50;
		
	this.svg = null;

  this.filteredImageData = null;

  this.svgData = null;

  this.imgWidth = 0;
  this.imgHeight = 0;
  this.imageOrientation = null;

  this.svgWidth = 0;
  this.svgHeight = 0;

  this.compositeData = null;
};

PhotoMask.prototype.createMaskedImage = function() {
	this.getCanvases();

	this.getRandomItems();

	this.createImage();
};

PhotoMask.prototype.getCanvases = function() {
	this.$originCanvas = $(document.createElement('canvas'));
	this.$compositeCanvas = $(document.createElement('canvas'));
	this.originctx = this.$originCanvas[0].getContext('2d');
	this.compositectx = this.$compositeCanvas[0].getContext('2d');
	this.$originCanvas.attr('height', this.availH).attr('width', this.availW);
	this.$compositeCanvas.attr('height', this.availH).attr('width', this.availW);
};

PhotoMask.prototype.getRandomItems = function() {
	this.randomColor =  this.colorPairs[Math.floor(Math.random() * this.colorPairs.length)];
	this.randomImage =  this.imgList[Math.floor(Math.random() * this.imgList.length)];
	this.randomSvg =  this.svgList[Math.floor(Math.random() * this.svgList.length)];
};

PhotoMask.prototype.createImage = function() {
	this.imgsrc = document.createElement('img');
	this.imgsrc.src = this.randomImage;
	
	var _this = this;
	this.imgsrc.addEventListener("load", function () {
		_this.drawOriginalImageToCanvas();
	}, false);

};


PhotoMask.prototype.drawOriginalImageToCanvas = function() {
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
	//	this.$svgCanvas.attr('height', h).attr('width', w);
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
		this.originctx.globalCompositeOperation = "destination-over";

		//set a background color to the canvas
		this.originctx.rect(x, y, w, h);
		this.originctx.fillStyle='rgba(' + this.randomColor.color2[0] + ', ' + this.randomColor.color2[1] + ', ' + this.randomColor.color2[2] + ', 1)';
		this.originctx.fill();

		//get image data of the colorized image
		this.filteredImageData = this.originctx.getImageData(0,0, w,h);

		this.filteredImage = this.$originCanvas[0].toDataURL();
		$(window).trigger('filteredImageCreated');

		//create the svg canvas
		this.createSvg();
};


PhotoMask.prototype.createComposite = function() {

	$('#header canvas').hide();

	var colorString = 'rgba(' + this.randomColor.color2[0] + ', ' + this.randomColor.color2[1] + ', ' +  this.randomColor.color2[2] + ', .8)';
	
	//$('#header').css('background-color', colorString);

	this.$compositeCanvas.show();
	var min = 0;
	var max = this.availW - (this.svgWidth);
	var randomX = Math.random() * (max - min) + min;

	this.compositectx.putImageData(this.filteredImageData, randomX, (this.availH - this.imgHeight) / 2);

	this.compositectx.globalCompositeOperation = "destination-in";
	
	this.compositectx.drawImage(this.svg, randomX, (this.availH - this.svgHeight) /2, this.svgWidth, this.svgHeight);

	var data = this.compositectx.getImageData(0, 0, this.availW, this.availH);
	var pixels = data.data;
	var numPixels = pixels.length;

//	this.fillBackground();

	this.compositeData = this.$compositeCanvas[0].toDataURL();

	$(window).trigger('compositeCreated');
	
};


PhotoMask.prototype.getFilteredImage = function() {
	return this.filteredImage;
};

PhotoMask.prototype.getData = function() {
	return this.compositeData;
};


PhotoMask.prototype.createSvg = function() {
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

		//_this.svgctx.drawImage(_this.svg, x, y, w, h);

		_this.createComposite();
	}
};

PhotoMask.prototype.clearCanvas = function() {
	this.originctx.clearRect(0,0,this.availW,this.availH);
};


PhotoMask.prototype.fillBackground = function() {
	this.compositectx.globalCompositeOperation = "destination-over";

	//set a background color to the canvas
	this.compositectx.rect(0, 0, this.availW, this.availH);
	this.compositectx.fillStyle='rgba(' + this.randomColor.color2[0] + ', ' + this.randomColor.color2[1] + ', ' + this.randomColor.color2[2] + ', 1)';
	this.compositectx.fill();
	
};

