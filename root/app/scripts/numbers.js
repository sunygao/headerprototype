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
	this.animationStyle = 'fadeIn';
	//this.animationStyle = 'displace';
	//this.animationStyle = 'countup';

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
	this.$previewCanvas.attr('height', this.previewH).attr('width', this.availW);

	this.svg = new Image();
	this.svg.src = this.shapeUrl;
	
	var _this = this;

	this.svg.onload = function() {
		_this.onSvgLoaded();		
		_this.initPixi();
		_this.setUpBinds();
	}

};

Numbers.prototype.onSvgLoaded = function() {
	this.svgWidth = this.svg.width;
	this.svgHeight = this.svg.height;

	var x, y, w, h, ratio;

	w = this.availW;
	h = this.svg.height * w / this.svg.width;
	x = 0;
	y = 0;
	
	this.svgWidth = w;
	this.svgHeight = h;

	var canvas = document.createElement('canvas');
	$(canvas).attr('height', h).attr('width', w);
	var ctx = canvas.getContext('2d');
	ctx.drawImage(this.svg, x, y, w, h);

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

	this.svgData = ctx.getImageData(0,0,w,h);

	this.drawPreview();	
};

Numbers.prototype.initPixi = function() {
	this.renderer = PIXI.autoDetectRenderer(this.availW, this.availH, { transparent: true });
	this.$el[0].appendChild(this.renderer.view);

	this.stage = new PIXI.Container();

	this.loadAssets();
};

Numbers.prototype.initCountUp = function() {
	var text = new PIXI.Text(0, { font: this.fontSize + ' ' + this.fontFamily, fill: 'white', align: 'top' });
	var data = this.$previewCanvas[0].toDataURL();
	var bg = new PIXI.Sprite.fromImage(data);
	this.bgContainer.addChild(bg);
//	this.bgContainer.mask = text;
	this.stage.addChild(this.bgContainer);
	
	var options = {
		useEasing : true, 
		useGrouping : true, 
		separator : ',', 
		decimal : '.', 
		prefix : '', 
		suffix : '' 
	};

	var numClean = this.num.replace(/,/g, '');
	var demo = new CountUp("testNum", 0, parseInt(numClean), 0, 1, options);

	var _this = this;

	demo.start(function() {
		var text = new PIXI.Text(_this.num, { font: _this.fontSize + ' ' + _this.fontFamily, fill: 'white', align: 'top' });		
		_this.characterContainer.addChild(text);
		_this.bgContainer.mask = text;
		_this.renderer.render(_this.stage);
	});

	$(window).bind('count', function(e, data) {
		var number = $('#testNum').text();
		var text = new PIXI.Text(number, { font: _this.fontSize + ' ' + _this.fontFamily, fill: 'white', align: 'top' });
		_this.characterContainer.addChild(text);
		_this.bgContainer.mask = text;
		_this.renderer.render(_this.stage);
	});
};

Numbers.prototype.loadAssets = function() {
	var loader = new PIXI.loaders.Loader();

  loader.add(this.displacementMap);

  $.each(this.characters, $.proxy(function(i, text) {
  	var slicedImage = this.getSlices(i, text)[0];
  	var bgPos = this.getSlices(i, text)[1];
  	loader.add(slicedImage);
  	this.pixiBgs.push({ image: slicedImage, x: bgPos });
  }, this));

  var _this = this;

  loader.load(function(item) {
  	_this.onAssetsLoaded();
  });
};

Numbers.prototype.getSlices = function(i, text) {
	var x = 0,
	prevMin = 0,
	prevMax = this.$previewCanvas.width(),
	charMin = 0,
	charMax = this.textWidth;

	var textX = this.characters[i+1] ? this.characters[i+1].x : charMax;
	var bgPos = Math.round((textX - charMin)/(charMax - charMin) * (prevMax - prevMin) + prevMin);
	var imageData = this.previewCtx.getImageData(x, 0, bgPos, this.previewH);
	var canvas = document.createElement('canvas');
	$(canvas).attr('height', this.previewH).attr('width', this.availW);
	var ctx = canvas.getContext('2d');
	ctx.putImageData(imageData, 0, 0);
	var slicedImage = canvas.toDataURL();

	return [slicedImage, bgPos];
};

Numbers.prototype.onAssetsLoaded = function() {
	//create a white bg
	var whiteBg = new PIXI.Graphics();
	whiteBg.beginFill(0xFFFFFF);
	whiteBg.drawRect(0, 0, this.availW, this.availH);
	this.stage.addChild(whiteBg);

	if(this.animationStyle == 'countup') {
		this.initCountUp();
	} else {
		this.draw();
	}
};

Numbers.prototype.animateIn = function() {
	$.each(this.pixiCharacters, $.proxy(function(i, item) {
		//if(this.animationStyle == 'fadeIn') {
			this.fadeIn(item, i);
		//}
	}, this));

	if(this.animationStyle == 'displace') {
		this.displacementSprite = PIXI.Sprite.fromImage(this.displacementMap);
		this.displacementSprite.scale.x = 2;
		this.displacementSprite.scale.y = 2;
		this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
		this.characterContainer.addChild(this.displacementSprite);
		var shadow = new PIXI.filters.DropShadowFilter();
		this.stage.filters = [this.displacementFilter];

		var _this = this;
		animate();
		
		function animate() {
			if(_this.displacementSprite.scale.x <= 100) {
				_this.displacementSprite.scale.x += .5;
				_this.displacementSprite.scale.y += .5;
				_this.renderer.render(_this.stage);
				requestAnimationFrame(animate);
			} else {
				cancelAnimationFrame(animate);
			}

			//console.log();
		
		}
	}

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
		var scrollTop = $(window).scrollTop();
		var scale = Math.max(1, .05 * scrollTop);
		TweenMax.set(_this.bgContainer, {
			x: -(.02 * scrollTop),
			y: -(.05 * scrollTop)
		});
		_this.renderer.render(_this.stage);
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
		_this.update();
	
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

Numbers.prototype.update = function() {
	var loader = new PIXI.loaders.Loader();
	this.pixiBgs = [];

  $.each(this.characters, $.proxy(function(i, text) {
  	var slicedImage = this.getSlices(i, text)[0];
  	var bgPos = this.getSlices(i, text)[1];
  	loader.add(slicedImage);
  	
  	this.pixiBgs.push({ image: slicedImage, x: bgPos });
  	
  }, this));

  var _this = this;

  loader.load(function(item) {
  	_this.draw();
  });
};

Numbers.prototype.draw = function() {
	this.pixiCharacters = [];

	if(this.characterContainer) {
		this.characterContainer.destroy(true);
		this.stage.removeChild(this.characterContainer);
	} 

	if(this.bgContainer) {
		this.bgContainer.destroy(true);
		this.stage.removeChild(this.bgContainer);
	}

	this.characterContainer = new PIXI.Container();
	this.bgContainer = new PIXI.Container();
	this.stage.addChild(this.characterContainer);

	$.each(this.characters, $.proxy(function(i, text) {
		var character = new PIXI.Text(text.character, { font: this.fontSize + ' ' + this.fontFamily, fill: 'white', align: 'top' });
		character.x = text.x;

		this.characterContainer.addChild(character);

		this.pixiCharacters.push(character);
		
		switch(this.animationStyle) {
			case 'fadeIn': 

				character.alpha = 0;
				character.y = 150;
			break;
				
			case 'displace':
				character.alpha = 0;
				//character.y = 150;
			break;

			default:
			break;
		}

		var bg = new PIXI.Sprite.fromImage(this.pixiBgs[i].image);
		var x =this.pixiBgs[i].x;
		bg.mask = character;		
		this.bgContainer.addChild(bg);

		this.stage.addChild(this.bgContainer);
		this.renderer.render(this.stage);

		if(i == this.characters.length - 1) {
			setTimeout($.proxy(function() {
				this.animateIn();
			}, this), 500);	
		}
	
	}, this));
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