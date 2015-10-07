'use strict';

/**
 * Main module - App entry point
 * @module Main
 */

var NumbersShader = function() {
	this.canvas = document.getElementById('numbers_canvas');

	this.vertex_shader = document.getElementById('2d-vertex-shader').textContent;
	this.fragment_shader = document.getElementById('2d-fragment-shader').textContent;
	
	this.init();
};

NumbersShader.prototype.init = function() {
	try {
		this.gl = this.canvas.getContext('experimental-webgl');
 
	} catch( error ) { 

	}
 
	if ( !this.gl ) {
 		throw "cannot create webgl context";
	}

	this.buffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
	this.gl.bufferData(
    this.gl.ARRAY_BUFFER,
    new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0]),
    this.gl.STATIC_DRAW);
 
	// Create Program
	this.currentProgram = this.createProgram(this.vertex_shader, this.fragment_shader);
	this.gl.useProgram(this.currentProgram);

	this.positionLocation = this.gl.getAttribLocation(this.currentProgram, "a_position");

	this.gl.enableVertexAttribArray(this.positionLocation);
	this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
	this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
};

NumbersShader.prototype.createProgram = function(vertex, fragment) {
	var program = this.gl.createProgram();
 
	var vs = this.createShader( vertex, this.gl.VERTEX_SHADER );
	var fs = this.createShader( '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment, this.gl.FRAGMENT_SHADER );

	if ( vs == null || fs == null ) return null;

	this.gl.attachShader( program, vs );
	this.gl.attachShader( program, fs );

	this.gl.deleteShader( vs );
	this.gl.deleteShader( fs );

	this.gl.linkProgram( program );

	if ( !this.gl.getProgramParameter( program, this.gl.LINK_STATUS ) ) {

		alert( "ERROR:\n" +
		"VALIDATE_STATUS: " + gl.getProgramParameter( program, gl.VALIDATE_STATUS ) + "\n" +
		"ERROR: " + gl.getError() + "\n\n" +
		"- Vertex Shader -\n" + vertex + "\n\n" +
		"- Fragment Shader -\n" + fragment );

		return null;

	}

	return program;
};

NumbersShader.prototype.createShader = function( src, type ) {
	var shader = this.gl.createShader( type );
	this.gl.shaderSource( shader, src );
	this.gl.compileShader( shader );
	if ( !this.gl.getShaderParameter( shader, this.gl.COMPILE_STATUS ) ) {
		alert( ( type == this.gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT" ) + " SHADER:\n" + this.gl.getShaderInfoLog( shader ) );
		return null;
	}
	return shader;
};



