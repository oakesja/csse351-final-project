var canvas;
var backgroundTexture;
var sunTexture, mercuryTexture, venusTexture, earthTexture, marsTexture, jupiterTexture, saturnTexture, uranusTexture, neptuneTexture; 

var sunRad = 54.62;
var merRad = .191;
var venRad = .475;
var earthRad = 1;
var marsRad = .265;
var jupRad = 5.61;
var satRad = 4.57;
var uraRad = 1.84;
var nepRad = 1.78;
var pluRad = .0892;

var planets = [];

var vBuffer, tBuffer, nBuffer;
var maxPoints = 6000 * 12;

var lightAmbient = vec4(0.1, 0.1, 0.1, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( .6, .6, .6, 1.0 );
var materialDiffuse = vec4( 1.0, 1, 1.0, 1.0 );
var materialSpecular = vec4( 1.0, 1, 1, 1.0 );
var materialShininess = 100.0;

var program;
var scale = 1;
var cameraX = 0;
var cameraY = 0;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    canvas.height = window.innerHeight -15;
    canvas.width = window.innerWidth - 15;
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0, 0, 0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    initializeBuffers(program);
    initializeTextures(program);

    planets.push(new Planet(0, 0, 0, .1, sunTexture, true));
    planets.push(new Planet(0, .7, 0, .1, mercuryTexture, false));
    planets.push(new Planet(0, .5, 0, .1, venusTexture, false));
    planets.push(new Planet(0, .3, 0, .1, earthTexture, false));
    planets.push(new Planet(-.3, .1, 0, .1, marsTexture, false));
    planets.push(new Planet(0.2, .1, 0, .1, jupiterTexture, false));
    planets.push(new Planet(.5, .7, 0, .1, saturnTexture, false));
    planets.push(new Planet(.5, .5, 0, .1, uranusTexture, false));
    planets.push(new Planet(0, -.3, 0, .1, neptuneTexture, false));
    
    for(var i=0; i<planets.length; i++){
        planets[i].create();
    }
    render();
}

var initializeBuffers = function(program){
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxPoints, gl.STATIC_DRAW );     
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxPoints, gl.STATIC_DRAW);
    
    var vTexCoord = gl.getAttribLocation (program, "vTexCoord");
    gl.vertexAttribPointer (vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16*maxPoints, gl.STATIC_DRAW);
    
    var vNormal = gl.getAttribLocation (program, "vNormal");
    gl.vertexAttribPointer (vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );   
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );
}

var initializeTextures = function(program){
    backgroundTexture = gl.createTexture();
    setupTexture(program, backgroundTexture, "newStars.gif");  

    sunTexture = gl.createTexture();
    setupTexture(program, sunTexture, "texture_sun.gif");  

    mercuryTexture = gl.createTexture();
    setupTexture(program, mercuryTexture, "texture_mercury.gif");    

    venusTexture = gl.createTexture();
    setupTexture(program, venusTexture, "texture_venus.gif"); 

    earthTexture = gl.createTexture();
    setupTexture(program, earthTexture, "texture_earth.gif");

    marsTexture = gl.createTexture();
    setupTexture(program, marsTexture, "texture_mars.gif"); 

    jupiterTexture = gl.createTexture();
    setupTexture(program, jupiterTexture, "texture_jupiter.gif"); 

    saturnTexture = gl.createTexture();
    setupTexture(program, saturnTexture, "texture_saturn.gif"); 

    uranusTexture = gl.createTexture();
    setupTexture(program, uranusTexture, "texture_uranus.gif"); 

    neptuneTexture = gl.createTexture();
    setupTexture(program, neptuneTexture, "texture_neptune.gif"); 
	
	asteroid1Texture = gl.createTexture();
    setupTexture(program, asteroid1Texture, "texture_asteroid.gif"); 
}

var setupTexture = function(program, texture, src){
    texture.image = new Image();
    texture.image.onload = function(){
        gl.bindTexture (gl.TEXTURE_2D, texture);
        gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);
        gl.bindTexture (gl.TEXTURE_2D, null);
    }
    texture.image.src = src;
}

var createAsteroid = function(centerX, centerY, centerZ, radius, vertArray, texArray, normArray){
    var latitudeBands = 10;
    var longitudeBands = 10;
    var vertexPositionData = [];
    var normals = [];
	
	var newRadius = radius*Math.random();
    
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        var tempVertices = [];
        var tempNormals = [];
        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
			
			var temp = Math.random()*10;
			
			if(temp<2){
				newRadius+=.02;
			}
			
			if(temp>8){
				newRadius-=.02;
			}
			
            tempVertices.push(vec4((newRadius * x * canvas.height / canvas.width) + centerX, newRadius * y + centerY, newRadius * z + centerZ, 1));
            tempNormals.push(vec4((x * canvas.height / canvas.width) + centerX, y + centerY, z + centerZ, 1));
        }
        vertexPositionData.push(tempVertices);
        normals.push(tempNormals);
    }

    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            nextLat = latNumber == latitudeBands ? 0 : latNumber + 1;
            nextLong = longNumber == latitudeBands ? 0 : longNumber + 1;

            var texUpperLeft = vec2(longNumber / longitudeBands, latNumber / latitudeBands);
            var texLowerLeft = vec2(longNumber / longitudeBands, nextLat / latitudeBands);
            var texUpperRight = vec2(nextLong / longitudeBands, latNumber / latitudeBands);
            var texLowerRight = vec2(nextLong / longitudeBands, nextLat / latitudeBands);

            vertArray.push(
                vertexPositionData[latNumber][longNumber],
                vertexPositionData[nextLat][longNumber],
                vertexPositionData[latNumber][nextLong]
            );
            normArray.push(
                normals[latNumber][longNumber],
                normals[nextLat][longNumber],
                normals[latNumber][nextLong]
            );
            texArray.push(texUpperLeft, texLowerLeft, texUpperRight);
            vertArray.push(
                vertexPositionData[latNumber][nextLong],
                vertexPositionData[nextLat][longNumber],
                vertexPositionData[nextLat][nextLong]
            );
            normArray.push(
                normals[latNumber][nextLong],
                normals[nextLat][longNumber],
                normals[nextLat][nextLong]
            );
            texArray.push(texUpperRight, texLowerLeft, texLowerRight);
            vertices+=6;
        }
    }
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // var backgroundPoints = [vec4(-1, -1, 0, 1), vec4(1, -1, 0, 1), vec4(-1, 1, 0, 1),  vec4(1, -1, 0, 1), vec4(1, 1, 0, 1), vec4(-1, 1, 0, 1)];
    // var backgroundTexCords = [vec2(1, 0), vec2(1, 1), vec2(0, 0), vec2(1, 1), vec2(0, 1), vec2(0, 0)];
    
    // gl.uniform1f( gl.getUniformLocation(program, "isBackground"), true );
    // gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(backgroundPoints));
    // gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    // gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(backgroundTexCords));     
    // gl.bindTexture (gl.TEXTURE_2D, backgroundTexture);
    // gl.drawArrays( gl.TRIANGLES, 0, vertices.length);


    mv = mat4  (scale, 0, 0, cameraX,
                0, scale, 0, cameraY,
                0, 0, scale, 0,
                0, 0, 0, 1);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(mv));

    var lightPosition = vec4(0, 0, 0, 1.0);
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );

    for(var i=0; i<planets.length; i++){
        planets[i].draw();
    }

    requestAnimFrame(render);
}


var drawElement = function(vertices, texCords, texture, normals){
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(normals));
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(texCords));     
    gl.bindTexture (gl.TEXTURE_2D, texture);
    gl.drawArrays( gl.TRIANGLES, 0, vertices.length);
}

window.onkeydown = function(e){
    var step = .1;
    switch (e.keyCode) {
        case 33:
            scale += step;
            render();
            break;
        case 34:
            scale -= step;
            render();
            break;
        case 37:
            cameraX -= step;
            render();
            break;
        case 38:
            cameraY += step;
            render();
            break;
        case 39:
            cameraX += step;
            render();
            break;
        case 40:
            cameraY -= step;
            render();
            break;
    }
}

function Planet(centerX, centerY, centerZ, radius, texture, isSun){
    this.centerX = centerX;
    this.centerY = centerY;
    this.centerZ = centerZ;
    this.radius = radius;
    this.texture = texture
    this.isSun = isSun;
    this.vertices = [];
    this.normals = [];
    this.texCords = [];
    this.create = createPlanet;
    this.draw = drawPlanet;
}

function createPlanet(){
    var latitudeBands = 30;
    var longitudeBands = 30;
    var vertexPositionData = [];
    var normals = [];
    
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        var tempVertices = [];
        var tempNormals = [];
        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            tempVertices.push(vec4((this.radius * x * canvas.height / canvas.width) + this.centerX, 
                this.radius * y + this.centerY, 
                this.radius * z + this.centerZ, 1));
            tempNormals.push(vec4((x * canvas.height / canvas.width) + this.centerX, 
                y + this.centerY, 
                z + this.centerZ, 1));
        }
        vertexPositionData.push(tempVertices);
        normals.push(tempNormals);
    }

    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            nextLat = latNumber == latitudeBands ? 0 : latNumber + 1;
            nextLong = longNumber == latitudeBands ? 0 : longNumber + 1;

            var texUpperLeft = vec2(longNumber / longitudeBands, latNumber / latitudeBands);
            var texLowerLeft = vec2(longNumber / longitudeBands, nextLat / latitudeBands);
            var texUpperRight = vec2(nextLong / longitudeBands, latNumber / latitudeBands);
            var texLowerRight = vec2(nextLong / longitudeBands, nextLat / latitudeBands);

            this.vertices.push(
                vertexPositionData[latNumber][longNumber],
                vertexPositionData[nextLat][longNumber],
                vertexPositionData[latNumber][nextLong]
            );
            this.normals.push(
                normals[latNumber][longNumber],
                normals[nextLat][longNumber],
                normals[latNumber][nextLong]
            );
            this.texCords.push(texUpperLeft, texLowerLeft, texUpperRight);
            this.vertices.push(
                vertexPositionData[latNumber][nextLong],
                vertexPositionData[nextLat][longNumber],
                vertexPositionData[nextLat][nextLong]
            );
            this.normals.push(
                normals[latNumber][nextLong],
                normals[nextLat][longNumber],
                normals[nextLat][nextLong]
            );
            this.texCords.push(texUpperRight, texLowerLeft, texLowerRight);
        }
    }
}

function drawPlanet(){
    gl.uniform1f( gl.getUniformLocation(program, "isSun"), this.isSun );
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(this.normals));
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(this.vertices));
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(this.texCords));     
    gl.bindTexture (gl.TEXTURE_2D, this.texture);
    gl.drawArrays( gl.TRIANGLES, 0, this.vertices.length);
}
