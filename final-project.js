var canvas;
var earthTexture, sunTexture, mercuryTexture; 
var vertices = 0;
var earthTexCords = [];
var earthVertices = [];
var sunTexCords = [];
var sunVertices = [];
var mercuryTexCords = [];
var mercuryVertices = [];
var vBuffer, tBuffer;
var maxPoints = 6000 * 12;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    initializeBuffers(program);
    initializeTextures(program);

    createSphere(0, .9, 0, .1, earthVertices, earthTexCords);
    createSphere(0, 0, 0, .1, sunVertices, sunTexCords);
    createSphere(0, .4, 0, .1, mercuryVertices, mercuryTexCords);
   
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
    earthTexture = gl.createTexture();
    earthTexture.image = new Image();
    earthTexture.image.onload = function(){
        gl.bindTexture (gl.TEXTURE_2D, earthTexture);
        gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, earthTexture.image);
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);
        gl.bindTexture (gl.TEXTURE_2D, null);
    }
    earthTexture.image.src = "texture_earth.gif";

    sunTexture = gl.createTexture();
    sunTexture.image = new Image();
    sunTexture.image.onload = function(){
        gl.bindTexture (gl.TEXTURE_2D, sunTexture);
        gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, sunTexture.image);
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);
        gl.bindTexture (gl.TEXTURE_2D, null);
    }
    sunTexture.image.src = "texture_sun.gif";

    mercuryTexture = gl.createTexture();
    mercuryTexture.image = new Image();
    mercuryTexture.image.onload = function(){
        gl.bindTexture (gl.TEXTURE_2D, mercuryTexture);
        gl.texImage2D (gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, mercuryTexture.image);
        gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);
        gl.bindTexture (gl.TEXTURE_2D, null);
    }
    mercuryTexture.image.src = "texture_mercury.gif";
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
            temp.push(vec4(radius * x + centerX, radius * y + centerY, radius * z + centerZ, 1));
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
        
    drawSphere(earthVertices, earthTexCords, earthTexture);
    drawSphere(sunVertices, sunTexCords, sunTexture);
    drawSphere(mercuryVertices, mercuryTexCords, mercuryTexture);

    requestAnimFrame(render);
}

var drawSphere = function(vertices, texCords, texture){
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(texCords));     
    gl.bindTexture (gl.TEXTURE_2D, texture);
    gl.drawArrays( gl.TRIANGLES, 0, vertices.length);
}
