'use strict';

/**
 * Main module - App entry point
 * @module Main
 */

var VectorTest = function(){

	this.$el = $('#header2');
	this.availW = this.$el.width();
	this.availH = this.$el.outerHeight();
	this.$paperCanvas = $('#vector_canvas');
	this.shape = null;

	this.imgList = Config.imgList;

	this.svgList = Config.svgList;

	this.colorPairs = Config.colorArray;

	this.numItems = Math.round(Math.random() * (5 - 2) + 2);
	//this.numItems = 2;

	this.currentShape = 0;

	this.shapes = [];
};

VectorTest.prototype.getRandomItems = function() {
	this.randomColor =  this.colorPairs[Math.floor(Math.random() * this.colorPairs.length)];
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

	this.shape = project.importSVG(this.randomSvg, {
		expandShapes : true,
		onLoad: function(item) {
			_this.shape = item;
			_this.onShapeLoaded();
		}
	});	
};

VectorTest.prototype.onShapeLoaded = function() {

  this.shape.remove();
    //this.symbol.place();
	for (var i = 0; i < this.numItems; i++) {
		var shape = this.shape.clone();
		var path = shape.children[0];
		var width = path.bounds.width;
		var height = path.bounds.height;
		var symbol = new Symbol(shape);
		var point = new Point((i + 1) * 50, 100);
		var color = 'rgb(' + this.randomColor[i][0] +', ' + this.randomColor[i][1] + ', ' + this.randomColor[i][2] + ')'
		var instance = symbol.place(point);
		var shape = symbol.definition;
		
		var length = path.length;
		var dashArray = [length, length];

		instance.scale(i + 1, path.bounds.topLeft);
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

		this.shapes.push(shape);
		
	}

	var _this = this;

	view.onFrame = function() {
		var shape = _this.shapes[_this.currentShape];

		if(!shape) {
			return;
		}

		if(shape.dashOffset >= 0) {
				shape.dashOffset -= 10;
		} else {
   		if(shape.fillColor.alpha < 1) {
   			shape.fillColor.alpha += .1;
   		}	else {
   			if(_this.currentShape <= _this.shapes.length) {
   				_this.currentShape++;
   			}
   			
   		}
   	}
		// $.each(_this.shapes, function(i, shape) {
		// 	if(shape.dashOffset >= 0) {
		// 		shape.dashOffset -= 10;
		// 	} else {
  //  				if(shape.fillColor.alpha < 1) {
  //  					shape.fillColor.alpha += .1;
  //  				}
   			
  //  			}	
		// });
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




