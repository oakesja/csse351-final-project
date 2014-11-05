var canvas;
var backgroundTexture;
var sunTexture, mercuryTexture, venusTexture, earthTexture, marsTexture, jupiterTexture, saturnTexture, uranusTexture, neptuneTexture; 
var vertices = 0;

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

var sunTexCords = [];
var sunVertices = [];
var sunNormals = [];
var mercuryTexCords = [];
var mercuryVertices = [];
var mercuryNormals = [];
var venusTexCords = [];
var venusVertices = [];
var venusNormals = [];
var earthTexCords = [];
var earthVertices = [];
var earthNormals = [];
var marsTexCords = [];
var marsVertices = [];
var marsNormals = [];
var jupiterTexCords = [];
var jupiterVertices = [];
var jupiterNormals = [];
var saturnTexCords = [];
var saturnVertices = [];
var saturnNormals = [];
var uranusTexCords = [];
var uranusVertices = [];
var uranusNormals = [];
var neptuneTexCords = [];
var neptuneVertices = [];
var neptuneNormals = [];
var asteroid1TexCords = [];
var asteroid1Vertices = [];
var asteroid1Normals = [];
var vBuffer, tBuffer, nBuffer;
var maxPoints = 6000 * 12;

var lightPosition = vec4(0.0, 0.0, 0.0, 0.0);
var lightAmbient = vec4(0.1, 0.1, 0.1, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( .6, .6, .6, 1.0 );
var materialDiffuse = vec4( 1.0, 1, 1.0, 1.0 );
var materialSpecular = vec4( 1.0, 1, 1, 1.0 );
var materialShininess = 100.0;

var program;

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

    createSphere(0, 0, 0, .1, sunVertices, sunTexCords, sunNormals);
    createSphere(0, .7, 0, .1, mercuryVertices, mercuryTexCords, mercuryNormals);
    createSphere(0, .5, 0, .1, venusVertices, venusTexCords, venusNormals);
    createSphere(0, .3, 0, .1, earthVertices, earthTexCords, earthNormals);
    createSphere(-.3, .1, 0, .1, marsVertices, marsTexCords, marsNormals);
    createSphere(.2, .1, 0, .1, jupiterVertices, jupiterTexCords, jupiterNormals);
    createSphere(.5, .7, 0, .1, saturnVertices, saturnTexCords, saturnNormals);
    createSphere(.5, .5, 0, .1, uranusVertices, uranusTexCords, uranusNormals);
    createSphere(.5, -1, 0, .1, neptuneVertices, neptuneTexCords, neptuneNormals);
	createAsteroid(-.2,-.2, .2, .1, asteroid1Vertices, asteroid1TexCords, asteroid1Normals);
   
    render();
}

window.onresize = function() {
    canvas.height = window.innerHeight -15;
    canvas.width = window.innerWidth -15;
    gl.viewport( 0, 0, canvas.width, canvas.height );
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
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
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

var createSphere = function(centerX, centerY, centerZ, radius, vertArray, texArray, normArray){
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
            tempVertices.push(vec4((radius * x * canvas.height / canvas.width) + centerX, radius * y + centerY, radius * z + centerZ, 1));
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
    var backgroundPoints = [vec4(-1, -1, 0, 1), vec4(1, -1, 0, 1), vec4(-1, 1, 0, 1),  vec4(1, -1, 0, 1), vec4(1, 1, 0, 1), vec4(-1, 1, 0, 1)];
    var backgroundTexCords = [vec2(1, 0), vec2(1, 1), vec2(0, 0), vec2(1, 1), vec2(0, 1), vec2(0, 0)];
    
    // gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(backgroundPoints));
    // gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    // gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(backgroundTexCords));     
    // gl.bindTexture (gl.TEXTURE_2D, backgroundTexture);
    // gl.drawArrays( gl.TRIANGLES, 0, vertices.length);
        
    gl.uniform1f( gl.getUniformLocation(program, "isSun"), true );
    drawElement(sunVertices, sunTexCords, sunTexture, sunNormals);
    gl.uniform1f( gl.getUniformLocation(program, "isSun"), false );
    drawElement(mercuryVertices, mercuryTexCords, mercuryTexture, mercuryNormals);
    drawElement(venusVertices, venusTexCords, venusTexture, venusNormals);
    drawElement(earthVertices, earthTexCords, earthTexture, earthNormals);
    drawElement(marsVertices, marsTexCords, marsTexture, marsNormals);
    drawElement(jupiterVertices, jupiterTexCords, jupiterTexture, jupiterNormals);
    drawElement(saturnVertices, saturnTexCords, saturnTexture, saturnNormals);
    drawElement(uranusVertices, uranusTexCords, uranusTexture, uranusNormals);
    drawElement(neptuneVertices, neptuneTexCords, neptuneTexture, neptuneNormals);
	drawElement(asteroid1Vertices, asteroid1TexCords, asteroid1Texture, asteroid1Normals);

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
