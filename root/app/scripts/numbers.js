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
	this.displacementMap = 'static/img/displacement/perlin.png'
	//this.animationStyle = 'fadeIn';
	this.animationStyle = 'displace';

	this.num = $('#text_container .num').text();
	this.characters = [];

	this.pixiCharacters = [];
	this.pixiBgs = [];

	// this.$canvas = $('#numbers_canvas');
	// this.ctx = this.$canvas[0].getContext('2d');
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

	this.getText();

	this.init();	
};


Numbers.prototype.init = function() {
	// this.$canvas.attr('height', this.availH).attr('width', this.availW);
	this.$previewCanvas.attr('height', this.previewH).attr('width', this.availW);
	
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

		_this.initPixi();

		_this.setUpBinds();
	
	}

};

Numbers.prototype.initPixi = function() {
	this.renderer = PIXI.autoDetectRenderer(this.availW, this.availH, { transparent: true });
	this.$el[0].appendChild(this.renderer.view);

	this.stage = new PIXI.Container();

	//this.loadAssets();

	//create a white bg
	var whiteBg = new PIXI.Graphics();
	whiteBg.beginFill(0xFFFFFF);
	whiteBg.drawRect(0, 0, this.availW, this.availH);
	this.stage.addChild(whiteBg);

	this.bgContainer = new PIXI.Container();
	this.characterContainer = new PIXI.Container();
	this.displacementSprite = PIXI.Sprite.fromImage(this.displacementMap);
	this.displacementSprite.scale.x = 2;
	this.displacementSprite.scale.y = 2;
	this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
	this.characterContainer.addChild(this.displacementSprite);
	this.characterContainer.filters = [this.displacementFilter];

	var _this = this;
	animate();
	

	function animate() {

		_this.displacementSprite.scale.x += .1;
		_this.renderer.render(_this.stage);
		requestAnimationFrame(animate);
	}


	this.stage.addChild(this.characterContainer);

	var loader = new PIXI.loaders.Loader();
	var _this = this;
	var x = 0;
	
	var prevMin = 0,
	prevMax = this.$previewCanvas.width(),
	charMin = 0,
	charMax = this.textWidth;
	
	$.each(this.characters, function(i, text) {
		var character = new PIXI.Text(text.character, { font: _this.fontSize + ' ' + _this.fontFamily, fill: 'white', align: 'top' });
		character.x = text.x;

		switch(_this.animationStyle) {
			case 'fadeIn': 
				character.alpha = 0;
				character.y = 150;
			break;
				
			case 'displace':

			break;

			default:
			break;
		}

	
	
		_this.pixiCharacters.push(character);

		//split up the background into pieces that match the text
		var textX = _this.characters[i+1] ? _this.characters[i+1].x : charMax;
		var bgPos = Math.round((textX - charMin)/(charMax - charMin) * (prevMax - prevMin) + prevMin);
		var imageData = _this.previewCtx.getImageData(x, 0, bgPos, _this.previewH);
		var canvas = document.createElement('canvas');
		$(canvas).attr('height', _this.previewH).attr('width', _this.availW);
		var ctx = canvas.getContext('2d');
		ctx.putImageData(imageData, 0, 0);
		var slicedImage = canvas.toDataURL();
		_this.characterContainer.addChild(character);

			

		loader.add(slicedImage)
		.load(function(item) {
			var bg = new PIXI.Sprite.fromImage(slicedImage);
			x = bgPos;
			bg.mask = character;		
			_this.bgContainer.addChild(bg);
			_this.stage.addChild(_this.bgContainer);
			_this.pixiBgs.push(bg);
			_this.renderer.render(_this.stage);

			if(i == _this.characters.length - 1) {

				setTimeout(function() {
					_this.animateIn();
				}, 1000);
				
			}
		});
	});
};

Numbers.prototype.animateIn = function() {

	$.each(this.pixiCharacters, $.proxy(function(i, item) {
		if(this.animationStyle == 'fadeIn') {
			this.fadeIn(item, i);
		}
	}, this));

};

Numbers.prototype.fadeIn = function(item, i) {
	TweenMax.to(item, .3, {
		alpha: 1,
		y: 0,
		ease: 'easeOut',
		delay: i * .1,
		onUpdate: function() {
			this.renderer.render(this.stage);
		},
		onUpdateScope: this,
		onComplete: function() {

		}
	});
};

Numbers.prototype.setUpBinds = function() {
	var _this = this;

	$(window).on('scroll', function(e) {
		// var scrollTop = $(window).scrollTop();
		// var scale = Math.max(1, .05 * scrollTop);
		// console.log(scale);
		// TweenMax.set(_this.bgContainer.scale, {
		// 	x: scale
		// });
		// _this.renderer.render(_this.stage);
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
		//'background-image': 'url(' + this.colorData + ')',
		//'width': this.textWidth,
		//'margin-left' : -(this.textWidth/2)
	});
};

Numbers.prototype.drawShape = function() {
	this.previewCtx.putImageData(this.svgData, 0, 0);

};

Numbers.prototype.getText = function() {
	var font = this.fontSize + ' ' + this.fontFamily;
	var message = this.num;
	var w, x = 0, y;
	var dashLen = 220, dashOffset = dashLen, speed = 10,
	txt = message, i = 0;

	var canvas = document.createElement('canvas');
	$(canvas).attr('height', this.availH).attr('width', this.availW);
	var ctx = canvas.getContext('2d');
	
	ctx.fillStyle = 'black';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top'; // important!
	ctx.font = font;

	for (var i = 0; i < this.num.length; i++) {
    	var character = this.num.charAt(i);
    	var w = ctx.measureText(this.num.charAt(i)).width;
    	//ctx.fillText(character, x, 0);
   
    	this.characters.push({
    		character : character,
    		x : x
    	});
   
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