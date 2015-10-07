'use strict';

/**
 * Main module - App entry point
 * @module Main
 */

var Numbers = function() {
	this.$el = $('#numbers_container');
	this.availW = this.$el.width();
	this.availH = this.$el.height();
	this.previewH = this.availH;
	this.shapeUrl = 'static/svg/triangle.svg';

	this.num = $('#text_container .num').text();

	this.$canvas = $('#numbers_canvas');
	this.ctx = this.$canvas[0].getContext('2d');
	this.$previewCanvas = $('#bg');
	this.previewCtx = this.$previewCanvas[0].getContext('2d');
	this.$image = $('#image');

	this.fontFamily = 'bornregular';
	this.fontSize = '200px';
	this.bgColor = '#ffffff';

	this.colors = [];
	this.colorData = null;
	this.textWidth = 0;

	this.toggleColors();


	this.init();	
};


Numbers.prototype.init = function() {
	this.$canvas.attr('height', this.availH).attr('width', this.availW);
	this.$previewCanvas.attr('height', this.previewH).attr('width', this.availW);

	var _this = this;

	this.svg = new Image();
	this.svg.src = this.shapeUrl;
	
	var _this = this;

	this.svg.onload = function() {
		_this.svgWidth = _this.svg.width;
		_this.svgHeight = _this.svg.height;

		var x, y, w, h, ratio;

		w = _this.availW;
		h = _this.svg.height * w / _this.svg.width;
		x = 0;
		y = 0;
		
		_this.svgWidth = w;
		_this.svgHeight = h;

		var canvas = document.createElement('canvas');
		$(canvas).attr('height', h).attr('width', w);
		var ctx = canvas.getContext('2d');
		ctx.drawImage(_this.svg, x, y, w, h);

		var imageData = ctx.getImageData(x,y,w,h); 
  	var pixels = imageData.data;
  	var numPixels = pixels.length;
  	for (var i = 0; i < numPixels; i+= 4) {
			var average = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
		
			if(pixels[i] == 0 && pixels[i + 1] == 0 && pixels[i+3] == 0) {
				//console.log('here');
	    	pixels[i+3] = 0;

			} else {
				pixels[i] = 254;
	    	pixels[i+1] = 91;
	    	pixels[i+2] = 10;
			}
			
		}

		ctx.clearRect(0,0,w, h);

		ctx.putImageData(imageData, 0,0);
		_this.svgData = ctx.getImageData(0,0,w,h);


		_this.drawPreview();

		_this.writeText();

		_this.setUpBinds();
	
	}
		
};

Numbers.prototype.setUpBinds = function() {
	var _this = this;

	$(window).on('scroll', function(e) {
		var scrollTop = $(window).scrollTop();
		TweenMax.set(_this.$image, {
			backgroundPosition: -(.5 * scrollTop) + 'px ' + -(.5 * scrollTop) + 'px'
		});
	});

	$('#colors a').on('click', function(e) {
		e.preventDefault();
		var $parent = $(this).parent();
		if($parent.attr('data-active') == 'true') {
			$parent.attr('data-active', 'false');
		} else {
			$parent.attr('data-active', 'true');
		}
		_this.toggleColors();
		_this.drawPreview();
	});
};

Numbers.prototype.toggleColors = function() {
	this.colors = [];
	this.colorData = null;

	var _this = this;

	$.each($('#colors').find('[data-active="true"]'), function(i, color) {
		_this.colors.push(color);
	});
};

Numbers.prototype.drawPreview = function() {
	this.previewCtx.clearRect(0,0,this.availW, this.previewH);

	var _this = this;

	this.drawShape();

	this.previewCtx.globalCompositeOperation = 'destination-over';

	$.each(this.colors, function(i, color) {
		var offset = 50;
		var color = '#' + $(color).data('color');
		var w = _this.availW/_this.colors.length;
		var x = w * i;
		var h = _this.previewH;
		var y = 0;

		_this.previewCtx.save();
		_this.previewCtx.beginPath();
		_this.previewCtx.translate(0, 0);
		_this.previewCtx.moveTo(x, 0);

		_this.previewCtx.lineTo(w + x + offset, 0);

		_this.previewCtx.lineTo(w + x, _this.previewH);

		_this.previewCtx.lineTo(x - offset, _this.previewH);

		_this.previewCtx.closePath();
		_this.previewCtx.fillStyle = color;
		_this.previewCtx.fill();
		_this.previewCtx.restore();
	});


	this.colorData = this.$previewCanvas[0].toDataURL();
	this.$image.css({
		'background-image': 'url(' + this.colorData + ')',
		//'width': this.textWidth,
		//'margin-left' : -(this.textWidth/2)
	});
};

Numbers.prototype.drawShape = function() {
	
	this.previewCtx.putImageData(this.svgData, 0, 0);

};

Numbers.prototype.writeText = function() {
	var font = this.fontSize + ' ' + this.fontFamily;
	var message = this.num;
	var w, x = 0, y;
	var dashLen = 220, dashOffset = dashLen, speed = 10,
	txt = message, i = 0;
	
	this.ctx.rect(0, 0, this.availW, this.availH);
	this.ctx.fillStyle = this.bgColor;
	this.ctx.fill();

	this.ctx.globalCompositeOperation = 'xor';

	this.ctx.fillStyle = 'black';
	this.ctx.textAlign = 'left';
	this.ctx.textBaseline = 'top'; // important!
	this.ctx.font = font;


	for (var i = 0; i < this.num.length; i++) {
    	var character = this.num.charAt(i);
    	var w = this.ctx.measureText(this.num.charAt(i)).width;
    	this.ctx.fillText(character, x, 0);
    	x = x + w;
    	this.textWidth += w;
	}

};

Numbers.prototype.getTextHeight = function() {

  var text = $('<span>' + this.num +'</span>').css({ fontSize: this.fontSize, fontFamily: this.fontFamily });
  var block = $('<div style="display: inline-block; width: 1px; height: 0px;"></div>');

  var div = $('<div></div>');
  div.append(text, block);

  var body = $('body');
  body.append(div);
  var h = $(text).height();
  try {

    var result = {};

    block.css({ verticalAlign: 'baseline' });
    result.ascent = block.offset().top - text.offset().top;

    block.css({ verticalAlign: 'bottom' });
    result.height = block.offset().top - text.offset().top;

    result.descent = result.height - result.ascent;

  } finally {
    div.remove();
  }

  return result;
};