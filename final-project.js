var canvas;
var backgroundTexture;
var sunTexture, mercuryTexture, venusTexture, earthTexture, marsTexture, jupiterTexture, saturnTexture, uranusTexture, neptuneTexture; 

var NUM_PLANETS = 9;
var INCLINATIONS = [0, 7.005, 3.3947, 0, 1.857, 1.305, 2.484, 0.770, 1.769];
var ECCENTRICITIES = [0, 0.2056, 0.0068, 0.0167, 0.0934, 0.0484, 0.0542, 0.0472, 0.0086];
var RADII = [ 1.62, .191, .475, 1, .265, 0.61, 0.57, 0.84, 0.78 ];
var MIN_DISTANCES_FROM_SUN = [0.0, 460.0, 1075.0, 1471.0, 1667.0, 1809.0, 13480.0, 27390.0, 44560.0];
var MAX_DISTANCES_FROM_SUN = [0.0, 698.0, 1089.0, 1521.0, 1791.0, 1957.0, 15030.0, 30030.0, 45460.0];
var SCALE_FACTOR_DISTANCE = 0.0003;
var SCALE_FACTOR_RADIUS = 0.1;
var ROTATION_SPEED = 0.25; //increase or decrease to make planets move faster or slower

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
var textures = [];
var thetas = [];

var vBuffer, tBuffer, nBuffer;
var maxPoints = 6000 * 12;

// var lightAmbient = vec4(0.1, 0.1, 0.1, 1.0 );
// var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
// var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var ambientColor = vec4( .6, .6, .6, 1.0 );
var specularColor = vec4( 1.0, 1, 1.0, 1.0 );
var diffuseColor = vec4(.3, .3, .3, 1.0);
// var materialSpecular = vec4( 1.0, 1, 1, 1.0 );
// var materialShininess = 100.0;

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
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // ambientProduct = mult(lightAmbient, materialAmbient);
    // diffuseProduct = mult(lightDiffuse, materialDiffuse);
    // specularProduct = mult(lightSpecular, materialSpecular);
    
    initializeBuffers(program);
    initializeTextures(program);
    initializeThetas();

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
       "ambientColor"),flatten(ambientColor) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularColor"),flatten(specularColor) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseColor"),flatten(diffuseColor) );
    // gl.uniform4fv( gl.getUniformLocation(program, 
    //    "specularProduct"),flatten(specularProduct) );   
    // gl.uniform1f( gl.getUniformLocation(program, 
    //    "shininess"),materialShininess );
}

var initializeTextures = function(program){
    backgroundTexture = gl.createTexture();
    setupTexture(program, backgroundTexture, "newStars.gif");  

    sunTexture = gl.createTexture();
    setupTexture(program, sunTexture, "texture_sun.gif"); 
    textures.push(sunTexture); 

    mercuryTexture = gl.createTexture();
    setupTexture(program, mercuryTexture, "texture_mercury.gif");
    textures.push(mercuryTexture);    

    venusTexture = gl.createTexture();
    setupTexture(program, venusTexture, "texture_venus.gif"); 
    textures.push(venusTexture);

    earthTexture = gl.createTexture();
    setupTexture(program, earthTexture, "texture_earth.gif");
    textures.push(earthTexture);

    marsTexture = gl.createTexture();
    setupTexture(program, marsTexture, "texture_mars.gif"); 
    textures.push(marsTexture);

    jupiterTexture = gl.createTexture();
    setupTexture(program, jupiterTexture, "texture_jupiter.gif");
    textures.push(jupiterTexture); 

    saturnTexture = gl.createTexture();
    setupTexture(program, saturnTexture, "texture_saturn.gif"); 
    textures.push(saturnTexture);

    uranusTexture = gl.createTexture();
    setupTexture(program, uranusTexture, "texture_uranus.gif"); 
    textures.push(uranusTexture);

    neptuneTexture = gl.createTexture();
    setupTexture(program, neptuneTexture, "texture_neptune.gif"); 
    textures.push(neptuneTexture);
	
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

    planets = [];

    planets.push(new Planet(0, .1, textures[0]));
    planets[0].create();
    planets[0].draw();

    for(var i=1; i<NUM_PLANETS; i++){
        planets.push(new Planet(i, .05, textures[i]));
        planets[i].create();
        planets[i].draw();
    }

    incrementThetas();
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

function Planet(planetNum, radius, texture){
    var coords = getSphereCenter(planetNum);
    this.centerX = coords[0];
    this.centerY = coords[1];
    this.centerZ = coords[2];
    this.radius = radius;
    this.texture = texture
    if (planetNum==0){
        this.isSun = 1;
    } else {
        this.isSun = 0;
    }
    this.vertices = [];
    this.normals = [];
    this.texCords = [];
    this.create = createPlanet;
    this.draw = drawPlanet;
}

function createPlanet(){
    var latitudeBands = 20;
    var longitudeBands = 20;
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

function initializeThetas() {
    var i;
    for (i=0; i<NUM_PLANETS; i++){
        thetas[i] = 360*Math.random();
    }

}

//to animate planets about the sun
function incrementThetas() {
    var i;
    for (i=0; i<NUM_PLANETS; i++){
        thetas[i] = thetas[i] + 1.0*ROTATION_SPEED;
    }
}

//calculate the new center after thetas have changed
function getSphereCenter(planetNum) {
    var x = MAX_DISTANCES_FROM_SUN[planetNum]*SCALE_FACTOR_DISTANCE*Math.cos(thetas[planetNum]);
    var z = MIN_DISTANCES_FROM_SUN[planetNum]*SCALE_FACTOR_DISTANCE*Math.sin(thetas[planetNum]);
    var y = Math.sqrt(x*x + z*z)*Math.sin(INCLINATIONS[planetNum]);
    return [x, y, z];
}

function createNewVertices(){

    clearArrays();

    createSphere(0, RADII[0]*SCALE_FACTOR_RADIUS, sunVertices, sunTexCords);
    createSphere(1, RADII[1]*SCALE_FACTOR_RADIUS, mercuryVertices, mercuryTexCords);
    createSphere(2, RADII[2]*SCALE_FACTOR_RADIUS, venusVertices, venusTexCords);
    createSphere(3, RADII[3]*SCALE_FACTOR_RADIUS, earthVertices, earthTexCords);
    createSphere(4, RADII[4]*SCALE_FACTOR_RADIUS, marsVertices, marsTexCords);
    createSphere(5, RADII[5]*SCALE_FACTOR_RADIUS, jupiterVertices, jupiterTexCords);
    createSphere(6, RADII[6]*SCALE_FACTOR_RADIUS, saturnVertices, saturnTexCords);
    createSphere(7, RADII[7]*SCALE_FACTOR_RADIUS, uranusVertices, uranusTexCords);
    createSphere(8, RADII[8]*SCALE_FACTOR_RADIUS, neptuneVertices, neptuneTexCords);


}

function clearArrays() {

    sunTexCords = [];
    sunVertices = [];
    mercuryTexCords = [];
    mercuryVertices = [];
    venusTexCords = [];
    venusVertices = [];
    earthTexCords = [];
    earthVertices = [];
    marsTexCords = [];
    marsVertices = [];
    jupiterTexCords = [];
    jupiterVertices = [];
    saturnTexCords = [];
    saturnVertices = [];
    uranusTexCords = [];
    uranusVertices = [];
    neptuneTexCords = [];
    neptuneVertices = [];

}