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

	this.toggleColors();

	

	

	this.init();	
};


Numbers.prototype.init = function() {
	this.$canvas.attr('height', this.availH).attr('width', this.availW);
	this.$previewCanvas.attr('height', this.previewH).attr('width', this.availW);
	
	this.writeText();

	this.drawPreview();

	this.setUpBinds();	
};

Numbers.prototype.setUpBinds = function() {
	var _this = this;

	$(window).on('scroll', function(e) {
		var scrollTop = $(window).scrollTop();
		TweenMax.set(_this.$image, {
			y: -(.7 * scrollTop)
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
	var _this = this;
	
	$.each(this.colors, function(i, color) {
		var color = '#' + $(color).data('color');
		var w = (_this.availW/_this.colors.length) + (_this.availW/_this.colors.length) * .5;
		var x = w * i;
		var h = _this.previewH;
		var y = 0;
		_this.previewCtx.save();
		_this.previewCtx.beginPath();
		_this.previewCtx.translate(0, 0);
		_this.previewCtx.moveTo(x, 0);
		_this.previewCtx.lineTo(w + x, 0);
		_this.previewCtx.lineTo(x, _this.previewH);
		_this.previewCtx.lineTo(x-w, _this.previewH);
		_this.previewCtx.closePath();
		_this.previewCtx.fillStyle = color;
		_this.previewCtx.fill();
		_this.previewCtx.restore();
	});
	this.colorData = this.$previewCanvas[0].toDataURL();
	this.$image.css({
		'background-image': 'url(' + this.colorData + ')',
		'width': this.textWidth
	});
};

Numbers.prototype.writeText = function() {
	var font = this.fontSize + ' ' + this.fontFamily;
	var message = this.num;
	var w, x, y;

	this.ctx.fillStyle = 'black';
	this.ctx.textAlign = 'left';
	this.ctx.textBaseline = 'top'; // important!
	this.ctx.font = font;
	w = this.ctx.measureText(message).width;
	x = (this.availW/2) - (w/2);
	this.ctx.fillText(message, x, 0);
	this.textWidth = w;

	this.ctx.globalCompositeOperation = 'xor';

	this.ctx.rect(0, 0, this.availW, this.availH);
	this.ctx.fillStyle = this.bgColor;
	this.ctx.fill();
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