'use strict';

/**
 * Main module - App entry point
 * @module Main
 */

var Displacement = function(){
	this.$el = $('#header3');
	this.availW = this.$el.width();
	this.availH = this.$el.outerHeight();
	this.bgUrl = 'static/img/mountains.jpg';
	this.displacementUrl = 'static/img/displacement.jpg';
	this.photoUrl = 'static/img/hands.jpg';
	this.videoUrl = 'static/video/video1_bw.mp4';
	this.offsetIncrement = 1;
	this.maxScale = 400;
	this.currentoffset = 400;
	this.colorOffset = 0;
	this.maskedPhoto = null;
	this.hideVideo = false;
	this.photoShown = false;

	this.vertices = [];
	this.vertices.push({
	    x: 200,
	    y: -20
	});
	this.vertices.push({
	    x: this.availW/2,
	    y: this.availH
	});
	this.vertices.push({
	   	x: this.availW - 200,
	    y: -20
	});

	this.curTime = 1;
};

/**
 * Callback fired once the document is ready
 * @public
 */
Displacement.prototype.initialize = function() {
	var photoMask = new PhotoMask();
	photoMask.createMaskedImage();

	var _this = this;

	$(window).bind('compositeCreated', function() {
		_this.maskedPhoto = photoMask.getData();
	});

	$(window).bind('filteredImageCreated', function() {
		_this.filteredPhoto = photoMask.getFilteredImage();
	});
	var colorString = 'rgba(' + photoMask.getColor().color1[0] + ', ' + photoMask.getColor().color1[1] + ' , ' + photoMask.getColor().color1[2] + ', 1)'
	this.color = rgb2hex(colorString);

	$(window).one('lineDone', function() {
		// this.maskContainer.alpha = 1;
		// this.shapeOutline.alpha = 0;

		TweenMax.to(_this.maskContainer, .5, {
			alpha: 1
		});
		TweenMax.to(_this.shapeOutline, .5, {
			alpha: 0
		});
	});


	this.renderer = PIXI.autoDetectRenderer(this.availW, this.availH, { transparent: true });

	this.$el[0].appendChild(this.renderer.view);

	this.stage = new PIXI.Container();
	
	this.loadAssets();
};


Displacement.prototype.loadAssets = function() {
	var _this  = this;
	PIXI.loader
    .add(this.bgUrl)
    .add(this.photoUrl)
    .add(this.displacementUrl)
    .add(this.videoUrl)
    .load(function(item) {
    	_this.onAssetsLoaded();
    });
};

Displacement.prototype.onAssetsLoaded = function() {
	this.container = new PIXI.Container();
	this.photoContainer = new PIXI.Container();
	this.maskContainer = new PIXI.Container();
	this.shapeContainer = new PIXI.Container();
	this.photoContainer.alpha = 0;
	this.videoContainer = new PIXI.Container();

	//this.container.alpha = 0;

	this.createBackground();
	this.createBgFilters();
	this.addPhoto();
	this.createShape();

	this.stage.addChild(this.container);
	//this.stage.addChild(this.photoContainer);
	this.stage.addChild(this.videoContainer);
	this.stage.addChild(this.shapeContainer);
	this.stage.addChild(this.maskContainer);
	
  this.renderer.render(this.stage);
 
 	var points = calcWaypoints(this.vertices);
 	this.animate(points); 
};

Displacement.prototype.createShape = function() {
	// create a new graphics object
	var img = new Image();
	img.src = this.filteredPhoto;
  var base =  new PIXI.BaseTexture(img);
  var photoTexture = new PIXI.Texture(base);
  var photo = new PIXI.Sprite(photoTexture);
  
  photo.anchor = new PIXI.Point(0.5, 0);
  photo.scale.x = this.scaleLandscape(photoTexture.width, photoTexture.height).w;
  photo.scale.y = photo.scale.x;
  photo.position.x = this.availW*0.5;
  photo.position.y = (this.availH * .5) - (photo.height * .5) // - photo.height;
  //this.photoContainer.addChild(photo);
	
	this.shape = new PIXI.Graphics();
	this.shapeOutline = new PIXI.Graphics();
	console.log(this.color);
	this.shapeOutline.lineStyle(5, '0x' + this.color, 1);
	this.shapeOutline.moveTo(200, -20);

	this.shape.moveTo(200, -20);

	this.shape.beginFill(0x8bc5ff, 0.4);
	for (var i = 0; i < this.vertices.length; i++) {
		this.shape.lineTo(this.vertices[i].x, this.vertices[i].y);
	}
	this.shape.endFill();

	photo.mask = this.shape;
	this.maskContainer.alpha = 0;
	this.maskContainer.addChild(photo);
	this.colorFilter = new PIXI.filters.ColorMatrixFilter();
	var shadow = new PIXI.filters.DropShadowFilter();
	this.maskContainer.filters = [this.colorFilter, shadow];
	// add it the stage so we see it on our screens..
	this.maskContainer.addChild(this.shape);
	this.shapeContainer.addChild(this.shapeOutline);
};


Displacement.prototype.createBackground = function() {
	var _this = this;
	var bg = new PIXI.Sprite.fromImage(this.bgUrl);
	var ogW = bg.width;
	var ogH = bg.height;
	bg.position.x = this.availW*0.5;
    bg.position.y = this.availH*0.5;
    bg.scale.x = this.scaleLandscape(ogW, ogH).w;
    bg.scale.y = this.scaleLandscape(ogW, ogH).h;
    bg.anchor = new PIXI.Point(0.5, 0.5);
 	this.blurFilter = new PIXI.filters.BlurFilter();
    this.container.addChild(bg);
   
    this.video = document.createElement('video');
    var duration;
	//video.loop = true;              
	this.video.src = this.videoUrl;
	this.video.addEventListener('playing', function() {
		//_this.container.alpha = 1;
		_this.photoContainer.alpha = 1;	
	});
	this.video.addEventListener('loadedmetadata', function() {
		duration = _this.video.duration;
	});
	this.video.addEventListener('timeupdate', function(e) {
		if(_this.video.currentTime >= duration - 6) {
			TweenMax.to(_this.videoContainer, 1, {
				alpha: 0
			});
		}
	});

	var texture = PIXI.Texture.fromVideo(this.video);
	this.videoSprite = new PIXI.Sprite(texture);

	this.videoSprite.width = this.renderer.width * 2;
	this.videoSprite.height = this.renderer.height * 2;
	this.videoSprite.anchor = new PIXI.Point(0.5, 0);
	var invertFilter = new PIXI.filters.InvertFilter();

	this.videoSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
		
	this.videoContainer.addChild(this.videoSprite);
};

Displacement.prototype.createBgFilters = function() {
	this.displacementSprite = PIXI.Sprite.fromImage(this.displacementUrl);
  this.displacementSprite.scale.x = this.scaleLandscape(this.displacementSprite.width, this.displacementSprite.height).w;
  this.displacementSprite.scale.y = this.scaleLandscape(this.displacementSprite.width, this.displacementSprite.height).h;
  this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
  this.colorFilter = new PIXI.filters.ColorMatrixFilter();
 // this.colorFilter.desaturate(true);
  
 	this.container.addChild(this.displacementSprite);
 	this.container.filters = [this.colorFilter, this.displacementFilter, this.blurFilter];
};

Displacement.prototype.addPhoto = function() {
    var img = new Image();
		img.src = this.maskedPhoto;
    var base =  new PIXI.BaseTexture(img);
    var photoTexture = new PIXI.Texture(base);
    var photo = new PIXI.Sprite(photoTexture);
    photo.position.x = this.availW*0.5;
    photo.position.y = 0;
    photo.anchor = new PIXI.Point(0.5, 0);
    photo.scale.x = this.scalePortrait(photoTexture.width, photoTexture.height).w;
    photo.scale.y = this.scalePortrait(photoTexture.width, photoTexture.height).h;
    this.photoContainer.addChild(photo);
    //photo.blendMode = PIXI.BLEND_MODES.DARKEN;
  	this.photoContainer.filters = [this.colorFilter];
};

Displacement.prototype.animate = function(points) {
	var _this = this;
	this.videoSprite.width += 10;
	this.videoSprite.height += 10;

	if(this.hideVideo) {
		this.videoContainer.alpha -= .5;
	}

	if(this.videoContainer.alpha <= 0 && this.container.alpha <= 1) {
		//this.container.alpha += .05;
	}
	if(this.displacementSprite) {
		this.displacementFilter.scale.x = this.currentoffset;
		this.displacementFilter.scale.y = this.currentoffset;
	}

	this.currentoffset += this.offsetIncrement;

	this.colorOffset += .5;
  //var matrix = this.colorFilter.matrix;
  this.colorFilter.hue(this.colorOffset);

  this.animateLine(points);
	if (this.curTime < points.length) {
		this.shapeOutline.moveTo(points[this.curTime - 1].x, points[this.curTime - 1].y);
	  this.shapeOutline.lineTo(points[this.curTime].x, points[this.curTime].y);
	} else {	
		$(window).trigger('lineDone');
	}

  this.curTime++;

	this.renderer.render(this.stage);

  requestAnimationFrame(function() {
		_this.animate(points);
	});
};

Displacement.prototype.animateLine = function() {

};

Displacement.prototype.scaleLandscape = function(ogW, ogH) {
	var newW = this.availW/ogW;
	var newH = ogH * newW / this.availH;
    
    return { w: newW, h: newH };
};

Displacement.prototype.scalePortrait = function(ogW, ogH) {
	var newH = this.availH/ogH;
	var newW =  ogW * newH / ogW;

    return { w: newW, h: newH };
};

function calcWaypoints(vertices) {
    var waypoints = [];
    for (var i = 1; i < vertices.length; i++) {
        var pt0 = vertices[i - 1];
        var pt1 = vertices[i];
        var dx = pt1.x - pt0.x;
        var dy = pt1.y - pt0.y;
        for (var j = 0; j < 100; j++) {
            var x = pt0.x + dx * j / 100;
            var y = pt0.y + dy * j / 100;
            waypoints.push({
                x: x,
                y: y
            });
        }
    }
    return (waypoints);
}

function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}


