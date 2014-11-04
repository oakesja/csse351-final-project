var canvas;
var backgroundTexture;
var sunTexture, mercuryTexture, venusTexture, earthTexture, marsTexture, jupiterTexture, saturnTexture, uranusTexture, neptuneTexture; 
var vertices = 0;
var sunTexCords = [];
var sunVertices = [];
var mercuryTexCords = [];
var mercuryVertices = [];
var venusTexCords = [];
var venusVertices = [];
var earthTexCords = [];
var earthVertices = [];
var marsTexCords = [];
var marsVertices = [];
var jupiterTexCords = [];
var jupiterVertices = [];
var saturnTexCords = [];
var saturnVertices = [];
var uranusTexCords = [];
var uranusVertices = [];
var neptuneTexCords = [];
var neptuneVertices = [];
var vBuffer, tBuffer;
var maxPoints = 6000 * 12;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    canvas.height = window.innerHeight -15;
    canvas.width = window.innerWidth - 15;
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0, 0, 0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    initializeBuffers(program);
    initializeTextures(program);

    createSphere(0, 0, 0, .1, sunVertices, sunTexCords);
    createSphere(0, .7, 0, .1, mercuryVertices, mercuryTexCords);
    createSphere(0, .5, 0, .1, venusVertices, venusTexCords);
    createSphere(0, .3, 0, .1, earthVertices, earthTexCords);
    createSphere(-.3, .1, 0, .1, marsVertices, marsTexCords);
    createSphere(.2, .1, 0, .1, jupiterVertices, jupiterTexCords);
    createSphere(.5, .7, 0, .1, saturnVertices, saturnTexCords);
    createSphere(.5, .5, 0, .1, uranusVertices, uranusTexCords);
    createSphere(.5, -1, 0, .1, neptuneVertices, neptuneTexCords);
   
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

var createSphere = function(centerX, centerY, centerZ, radius, vertArray, texArray){
    var latitudeBands = 30;
    var longitudeBands = 30;
    var vertexPositionData = [];
    
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        var temp = [];
        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            temp.push(vec4((radius * x * canvas.height / canvas.width) + centerX, radius * y + centerY, radius * z + centerZ, 1));
        }
        vertexPositionData.push(temp);
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
            texArray.push(texUpperLeft, texLowerLeft, texUpperRight);
            vertArray.push(
                vertexPositionData[latNumber][nextLong],
                vertexPositionData[nextLat][longNumber],
                vertexPositionData[nextLat][nextLong]
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
    drawElement(backgroundPoints, backgroundTexCords, backgroundTexture);
        
    drawElement(sunVertices, sunTexCords, sunTexture);
    drawElement(mercuryVertices, mercuryTexCords, mercuryTexture);
    drawElement(venusVertices, venusTexCords, venusTexture);
    drawElement(earthVertices, earthTexCords, earthTexture);
    drawElement(marsVertices, marsTexCords, marsTexture);
    drawElement(jupiterVertices, jupiterTexCords, jupiterTexture);
    drawElement(saturnVertices, saturnTexCords, saturnTexture);
    drawElement(uranusVertices, uranusTexCords, uranusTexture);
    drawElement(neptuneVertices, neptuneTexCords, neptuneTexture);

    requestAnimFrame(render);
}

var drawElement = function(vertices, texCords, texture){
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(texCords));     
    gl.bindTexture (gl.TEXTURE_2D, texture);
    gl.drawArrays( gl.TRIANGLES, 0, vertices.length);
}
