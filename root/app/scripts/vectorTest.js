'use strict';

/**
 * Main module - App entry point
 * @module Main
 */

var VectorTest = function(){
	var photoMask = new PhotoMask();
	photoMask.createMaskedImage();

	this.$el = $('#header2');
	this.availW = this.$el.width();
	this.availH = this.$el.outerHeight();
	this.$paperCanvas = $('#vector_canvas');
	this.shape = null;

	this.imgList = Config.imgList;

	this.svgList = Config.svgList;

	this.colorPairs = Config.colorPairs;

	//this.numItems = Math.round(Math.random() * (5 - 2) + 2);
	this.numItems = 1;

	this.currentShape = 0;

	this.shapes = [];

	var _this = this;

	$(window).bind('filteredImageCreated', function() {
		_this.filteredPhoto = photoMask.getData();
		_this.randomColor = photoMask.getColor().color1;
		//console.log(_this.randomColor);
		_this.initialize();
	});
};

VectorTest.prototype.getRandomItems = function() {
//	this.randomColor =  this.colorPairs[Math.floor(Math.random() * this.colorPairs.length)];
	this.randomImage =  this.imgList[Math.floor(Math.random() * this.imgList.length)];
	this.randomSvg =  this.svgList[Math.floor(Math.random() * this.svgList.length)];
};

/**
 * Callback fired once the document is ready
 * @public
 */
VectorTest.prototype.initialize = function() {
	this.getRandomItems();

	this.paperctx = this.$paperCanvas[0].getContext('2d');
	
	this.$paperCanvas.attr('height', this.availH).attr('width', this.availW);

	paper.install(window);

	paper.setup('vector_canvas');

	var _this = this;



	this.raster = new Raster(this.filteredPhoto);
	
	this.raster.onLoad = function() {
   	_this.raster.position = new Point(_this.raster.width/2, _this.raster.height/2);
   	_this.rasterW = _this.raster.width;
		_this.rasterH = _this.raster.height;

		_this.shape = project.importSVG(_this.randomSvg, {
			expandShapes : true,
			onLoad: function(item) {
				_this.shape = item;
				//_this.onShapeLoaded();
				_this.onLoad();
			}
		});	
	};

};

VectorTest.prototype.onLoad = function() {
	var i = 2;
	var shape = this.shape;
	var path = shape.children[0];
	var width = path.bounds.width;
	var height = path.bounds.height;

	var newW = this.rasterW/width;
	var newH = this.rasterH/height;

	shape.scale(newW, newH, path.bounds.topLeft);
		//var symbol = new Symbol(shape);
	//	var point = new Point((i + 1) * 50, 10);
	var point = [0, 0];
	var color = 'rgb(' + this.randomColor[0] +', ' + this.randomColor[1] + ', ' + this.randomColor[2] + ')';

	// var instance = symbol.place(point);
		// var shape = symbol.definition;
		
	var length = path.length;
	var dashArray = [length, length];

	//shape.scale(5, path.bounds.topLeft);
	shape.fillColor = color;
	shape.strokeColor = color;
	shape.fillColor.alpha = 0;
	shape.strokeWidth = 3;
	shape.dashArray = [length, length];
	shape.dashOffset = length;
	shape.shadowColor = new Color(0, 0, 0);
	shape.shadowColor.alpha = .5;
	shape.shadowBlur = 12;
	shape.shadowOffset = new Point(5, 5);

	var mask = shape.clone();
	this.clipGroup = new Group(mask, this.raster);
	this.raster.opacity = 0;
 	this.clipGroup.clipped = true;

 	var _this = this;
  	view.onFrame = function() {
		//var shape = _this.shapes[_this.currentShape];

		if(!shape) {
			return;
		}

		if(shape.dashOffset >= 0) {
				shape.dashOffset -= 50;
		} else {
   		if(shape.fillColor && shape.fillColor.alpha < 1) {
   			shape.fillColor.alpha += .1;
   		}	else {
   			if(_this.currentShape <= _this.shapes.length) {
   				_this.currentShape++;
   			} 		
   			shape.strokeColor.alpha = 0;
   			_this.clipGroup.clipped = true;
   			_this.raster.opacity = 1;
   		}
   	}

	};

};

VectorTest.prototype.onShapeLoaded = function() {
 
  var _this = this;

	for (var i = 0; i < this.numItems; i++) {
		var shape = this.shape;
		var path = shape.children[0];
		var width = path.bounds.width;
		var height = path.bounds.height;
		//var symbol = new Symbol(shape);
	//	var point = new Point((i + 1) * 50, 10);
	var point = [0, 0];
		var color = 'rgb(' + this.randomColor[i][0] +', ' + this.randomColor[i][1] + ', ' + this.randomColor[i][2] + ')';

		// var instance = symbol.place(point);
		// var shape = symbol.definition;
		
		var length = path.length;
		var dashArray = [length, length];

		shape.scale(5, path.bounds.topLeft);
		shape.fillColor = color;
		shape.strokeColor = color;
		//shape.fillColor.alpha = 0;
		shape.strokeWidth = 5;
		shape.dashArray = [length, length];
		//shape.dashOffset = length;
		shape.shadowColor = new Color(0, 0, 0);
		shape.shadowColor.alpha = .5;
		shape.shadowBlur = 12;
		shape.shadowOffset = new Point(5, 5);

		this.shapes.push(shape);


		
	}

	var _this = this;

	view.onFrame = function() {
		// var shape = _this.shapes[_this.currentShape];

		// if(!shape) {
		// 	return;
		// }

		// if(shape.dashOffset >= 0) {
		// 		shape.dashOffset -= 10;
		// } else {
  //  		if(shape.fillColor.alpha < 1) {
  //  			shape.fillColor.alpha += .1;
  //  		}	else {
  //  			if(_this.currentShape <= _this.shapes.length) {
  //  				_this.currentShape++;
  //  			} 		
  //  		}
  //  	}

	};
	
};

VectorTest.prototype.drawShape = function(i) {

   	var _this = this;

   	view.onFrame = function(e) {
   		
   		
   		if(_this.shape.dashOffset >= 0) {
   			_this.shape.dashOffset -= 60;
   		} else {
   			if(_this.shape.fillColor.alpha < 1) {
   				_this.shape.fillColor.alpha += .1;
   			}
   			//_this.shape.fillColor = 'rgb(254, 91, 10)';
   			//_this.shape.shadowColor = new Color(0, 0, 0, .5);
   		}	
   	};
};




