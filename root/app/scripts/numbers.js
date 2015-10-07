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


	this.init();	
};


Numbers.prototype.init = function() {
	// this.$canvas.attr('height', this.availH).attr('width', this.availW);
	// this.$previewCanvas.attr('height', this.previewH).attr('width', this.availW);
	
	// this.writeText();

	this.drawPreview();

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 1, 1 ).normalize();
  scene.add(light);

	var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('static/img/test_header.jpg') } );
 	var textGeom = new THREE.TextGeometry('16,800', {
    font: 'born', // Must be lowercase!
    size: 50,
   // bevelEnabled: false,
    //height: 1
      
  });

  var textMesh = new THREE.Mesh( textGeom, material );

  scene.add( textMesh );

  var geometry = new THREE.CubeGeometry( 20, 20, 20);
 	var material2 = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('static/img/texture-atlas.jpg') } );

	var bricks = [new THREE.Vector2(0, .666), new THREE.Vector2(.5, .666), new THREE.Vector2(.5, 1), new THREE.Vector2(0, 1)];
	var clouds = [new THREE.Vector2(.5, .666), new THREE.Vector2(1, .666), new THREE.Vector2(1, 1), new THREE.Vector2(.5, 1)];
	var crate = [new THREE.Vector2(0, .333), new THREE.Vector2(.5, .333), new THREE.Vector2(.5, .666), new THREE.Vector2(0, .666)];
	var stone = [new THREE.Vector2(.5, .333), new THREE.Vector2(1, .333), new THREE.Vector2(1, .666), new THREE.Vector2(.5, .666)];
	var water = [new THREE.Vector2(0, 0), new THREE.Vector2(.5, 0), new THREE.Vector2(.5, .333), new THREE.Vector2(0, .333)];
	var wood = [new THREE.Vector2(.5, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, .333), new THREE.Vector2(.5, .333)];  

	geometry.faceVertexUvs[0] = [];

	geometry.faceVertexUvs[0][0] = [ bricks[0], bricks[1], bricks[3] ];
	geometry.faceVertexUvs[0][1] = [ bricks[1], bricks[2], bricks[3] ];
	  
	geometry.faceVertexUvs[0][2] = [ clouds[0], clouds[1], clouds[3] ];
	geometry.faceVertexUvs[0][3] = [ clouds[1], clouds[2], clouds[3] ];
	  
	geometry.faceVertexUvs[0][4] = [ crate[0], crate[1], crate[3] ];
	geometry.faceVertexUvs[0][5] = [ crate[1], crate[2], crate[3] ];
	  
	geometry.faceVertexUvs[0][6] = [ stone[0], stone[1], stone[3] ];
	geometry.faceVertexUvs[0][7] = [ stone[1], stone[2], stone[3] ];
	  
	geometry.faceVertexUvs[0][8] = [ water[0], water[1], water[3] ];
	geometry.faceVertexUvs[0][9] = [ water[1], water[2], water[3] ];
	  
	geometry.faceVertexUvs[0][10] = [ wood[0], wood[1], wood[3] ];
	geometry.faceVertexUvs[0][11] = [ wood[1], wood[2], wood[3] ];

	var mesh = new THREE.Mesh(geometry,  material2);

  scene.add( mesh );

	camera.position.z = 200;
	camera.position.x = 60;


	function render() {
		requestAnimationFrame( render );
		renderer.render( scene, camera );
	 mesh.rotation.x += .05;
	 mesh.rotation.y += .05;
	 //textMesh.rotation.x += .05;
	 //textMesh.rotation.y += .05;

	}
	render();
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
		'width': this.textWidth,
		//'margin-left' : -(this.textWidth/2)
	});
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

	


	var _this = this;

	// (function loop() {
 //  		_this.ctx.clearRect(x, 0, 60, 150);
 //  		_this.ctx.setLineDash([dashLen - dashOffset, dashOffset - speed]); // create a long dash mask
 //  		dashOffset -= speed;                                         // reduce dash length
 //  		_this.ctx.strokeText(txt[i], x, 0);                               // stroke letter
 //  		console.log(dashOffset);
 //  		if (dashOffset > 0) {
 //  			requestAnimationFrame(loop); 
 //  		} else {
 //    		// _this.ctx.fillText(txt[i], x, 90);                               // fill final letter
 //    		dashOffset = dashLen;                                      // prep next char
 //    		x += _this.ctx.measureText(txt[i++]).width +_this.ctx.lineWidth * Math.random();
 //    		//_this.ctx.setTransform(1, 0, 0, 1, 0, 3 * Math.random());        // random y-delta
 //    		//_this.ctx.rotate(Math.random() * 0.005);                         // random rotation
 //    		if (i < txt.length)  {
 //    			requestAnimationFrame(loop);
 //    		}
 //  		}
  
	// })();
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