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
	this.videoContainer = new PIXI.Container();

	this.container.alpha = 0;

	this.createBackground();
	this.createBgFilters();
	//this.addVideo();
	// this.addPhoto();

	this.stage.addChild(this.container);
	this.stage.addChild(this.videoContainer);
	this.stage.addChild(this.photoContainer);
   	
    this.renderer.render(this.stage);
   
   	this.animate(); 
};

Displacement.prototype.addVideo = function() {
	
	
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
 
    this.container.addChild(bg);
   
    var video = document.createElement('video');
    var duration;
	//video.loop = true;              
	video.src = this.videoUrl;
	video.addEventListener('play', function() {
		_this.container.alpha = 1;
	});
	video.addEventListener('loadedmetadata', function() {
		duration = video.duration;
	});
	video.addEventListener('timeupdate', function(e) {
		if(video.currentTime >= duration - 5) {
			_this.hideVideo = true;
		}
	});


	var texture = PIXI.Texture.fromVideo(video);
	var videoSprite = new PIXI.Sprite(texture);

	videoSprite.width = this.renderer.width * 2;
	videoSprite.height = this.renderer.height * 2;
	videoSprite.anchor = new PIXI.Point(0.5, 0);
	var invertFilter = new PIXI.filters.InvertFilter();

	//videoSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
	//videoSprite.filters = [invertFilter];
	videoSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
	//bg.mask = videoSprite;
	
	
	this.videoContainer.addChild(videoSprite);
	


};

Displacement.prototype.createBgFilters = function() {
	this.displacementSprite = PIXI.Sprite.fromImage(this.displacementUrl);
    this.displacementSprite.scale.x = this.scaleLandscape(this.displacementSprite.width, this.displacementSprite.height).w;
    this.displacementSprite.scale.y = this.scaleLandscape(this.displacementSprite.width, this.displacementSprite.height).h;
    this.displacementFilter = new PIXI.filters.DisplacementFilter(this.displacementSprite);
    this.colorFilter = new PIXI.filters.ColorMatrixFilter();
    this.colorFilter.desaturate(true);
    
   	this.container.addChild(this.displacementSprite);
   	this.container.filters = [this.colorFilter, this.displacementFilter];
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
};

Displacement.prototype.animate = function() {
	var _this = this;
	
	if(this.hideVideo && this.videoContainer.alpha > 0) {
		this.videoContainer.alpha -= .01;
	}
	this.displacementFilter.scale.x = this.currentoffset;
	this.displacementFilter.scale.y = this.currentoffset;
	this.currentoffset += this.offsetIncrement;

	this.colorOffset += .5;
    //var matrix = this.colorFilter.matrix;
    this.colorFilter.hue(this.colorOffset);

    // matrix[1] = Math.sin(this.colorOffset) * 3;
    // matrix[2] = Math.cos(this.colorOffset);
    // matrix[3] = Math.cos(this.colorOffset) * 1.5;
    // matrix[4] = Math.sin(this.colorOffset / 3) * 2;
    // matrix[5] = Math.sin(this.colorOffset / 2);
    // matrix[6] = Math.sin(this.colorOffset / 4);

	this.renderer.render(this.stage);

	requestAnimationFrame(function() {
		_this.animate();
	});
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

