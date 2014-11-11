var canvas;
var backgroundTexture;
var sunTexture, mercuryTexture, venusTexture, earthTexture, marsTexture, jupiterTexture, saturnTexture, uranusTexture, neptuneTexture;
var saturnRingTexture, deathStarTexture;

var NUM_PLANETS = 9;
var INCLINATIONS = [0, 7.005, 3.3947, 0, 1.857, 1.305, 2.484, 0.770, 1.769];
var sunTexture, mercuryTexture, venusTexture, earthTexture, marsTexture, jupiterTexture, saturnTexture, uranusTexture, neptuneTexture, asteroidTexture;

var ASTEROID_FREQ = 10;
var ASTEROID_RAD = .02;
var ASTEROID_RAND = .002;
var ASTEROID_SIDES = true;
var ASTEROID_BACK = false;
var NUM_PLANETS = 10;
var INCLINATIONS = [0, 7.005, 3.3947, 0, 1.857, 1.305, 2.484, 0.770, 1.769, .5]; // last value to test for asteroid, remove in final
var ECCENTRICITIES = [0, 0.2056, 0.0068, 0.0167, 0.0934, 0.0484, 0.0542, 0.0472, 0.0086];
var RADII = [1.62, .191, .475, 1, .265, 0.61, 0.57, 0.84, 0.78];
var MIN_DISTANCES_FROM_SUN = [0.0, 460.0, 1075.0, 1471.0, 1667.0, 1809.0, 13480.0, 27390.0, 44560.0, 1500.0]; // last values to test for asteroid, remove in final
var MAX_DISTANCES_FROM_SUN = [0.0, 698.0, 1089.0, 1521.0, 1791.0, 1957.0, 15030.0, 30030.0, 45460.0, 2000.0];
var SCALE_FACTOR_DISTANCE = 0.0003;
var SCALE_FACTOR_RADIUS = 0.1;
var ROTATION_SPEED = 0.04; //increase or decrease to make planets move faster or slower
var EXP_RAD = .05;
var EXP_RAND = .003;
var EXP_TIME = 10;
var EXP_AND_AST = false;
var DS_RAD = .2;
var DS_X = -1.2;
var DS_Y = -1.2;
var DS_Z = -.09;
var FIRING = false;
var FIRED = false;

var deathStar;
var deathStarTick = 0;
var deathStarTickSize = 0.008;
var deathStarMaxTick = .5;
var deathStarCooldown = 1000; // ms
var deathStarFireTime; 

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
var asteroids = [];
var textures = [];
var aTextures = [];
var thetas = [];
var explosions = [];
var explosionTexture;

var vBuffer, tBuffer, nBuffer;
var maxPoints = 6000 * 12;

var ambientColor = vec4(.6, .6, .6, 1.0);
var specularColor = vec4(1.0, 1, 1.0, 1.0);
var diffuseColor = vec4(.3, .3, .3, 1.0);

var program;
var SCALE = 1;
var CAMERA_X = 0;
var CAMERA_Y = 0;



window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    canvas.height = window.innerHeight - 15;
    canvas.width = window.innerWidth - 15;

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    initializeBuffers(program);
    initializeTextures(program);
    initializeThetas();

    deathStar = new DeathStar();
    deathStar.create();

    asteroids.push(new Asteroid(0, aTextures[0]));
    asteroids[0].create();

    window.addEventListener('resize', function(event){
        location.reload();
    });

    render();
}

window.onresize = function(){
    window.location.reload();
}

var initializeBuffers = function(program) {
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxPoints, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * maxPoints, gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16 * maxPoints, gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.uniform4fv(gl.getUniformLocation(program,
        "ambientColor"), flatten(ambientColor));
    gl.uniform4fv(gl.getUniformLocation(program,
        "specularColor"), flatten(specularColor));
    gl.uniform4fv(gl.getUniformLocation(program,
        "diffuseColor"), flatten(diffuseColor));
}

var initializeTextures = function(program) {
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

    saturnRingTexture = gl.createTexture();
    setupTexture(program, saturnRingTexture, "texture_saturn_ring.gif");

    uranusTexture = gl.createTexture();
    setupTexture(program, uranusTexture, "texture_uranus.gif");
    textures.push(uranusTexture);

    neptuneTexture = gl.createTexture();
    setupTexture(program, neptuneTexture, "texture_neptune.gif");
    textures.push(neptuneTexture);

    asteroidTexture = gl.createTexture();
    setupTexture(program, asteroidTexture, "texture_asteroid.gif");
    aTextures.push(asteroidTexture);

    explosionTextureTemp = gl.createTexture();
    setupTexture(program, explosionTextureTemp, "explosion.gif");
    explosionTexture = explosionTextureTemp;

    deathStarTexture = gl.createTexture();
    setupTexture(program, deathStarTexture, "texture_death_star.gif");
}

var setupTexture = function(program, texture, src) {
    texture.image = new Image();
    texture.image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    texture.image.src = src;
}

var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var backgroundPoints = [vec4(-1, -1, 0, 1), vec4(1, -1, 0, 1), vec4(-1, 1, 0, 1), vec4(1, -1, 0, 1), vec4(1, 1, 0, 1), vec4(-1, 1, 0, 1)];
    var backgroundTexCords = [vec2(1, 0), vec2(1, 1), vec2(0, 0), vec2(1, 1), vec2(0, 1), vec2(0, 0)];

    gl.uniform1f(gl.getUniformLocation(program, "isBackground"), true);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(backgroundPoints));
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(backgroundTexCords));
    gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
    gl.drawArrays(gl.TRIANGLES, 0, backgroundPoints.length);

    mv = mat4(SCALE, 0, 0, CAMERA_X,
        0, SCALE, 0, CAMERA_Y,
        0, 0, SCALE, 0,
        0, 0, 0, 1);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(mv));

    var lightPosition = vec4(0, 0, 0, 1.0);
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));

    planets = [];

    planets.push(new Planet(0, .1, textures[0]));
    planets[0].create();
    planets[0].draw();

    for (var i = 1; i < NUM_PLANETS - 1; i++) {
        planets.push(new Planet(i, .05, textures[i]));
        planets[i].create();
        planets[i].draw();
    }
    incrementThetas();

    if (Math.random() * 100 < ASTEROID_FREQ) {
        asteroids.push(new Asteroid(asteroids.length, aTextures[0]));
        asteroids[asteroids.length - 1].create();
    }

    for (var i = 0; i < asteroids.length; i++) {
        if (asteroids[i].centerY > 1.1 || asteroids[i].centerX > 1.1 || asteroids[i].centerZ > 1.1 || asteroids[i].time > 10) {
            asteroids.splice(i, 1);
        } else {
            asteroids[i].update();
            asteroids[i].draw();
        }
    }

    for (var i = 0; i < explosions.length; i++) {
        explosions[i].update();
        explosions[i].draw();
        if (explosions[i].time == 1) {
            for (var j = 0; j < 10; j++) {
                asteroids.push(new ExplosionAsteroid(explosions[i].planetTexture, explosions[i].centerX, explosions[i].centerY, explosions[i].centerZ));
                asteroids[asteroids.length - 1].create();
            }
        }
        if (explosions[i].time == EXP_TIME) {
            explosions.splice(i, 1);
        }
    }

    // moves death star
    if(deathStarActive()){
        mv2 = mat4(1, 0, 0, deathStarTick,
        0, 1, 0, deathStarTick,
        0, 0, 1, deathStarTick,
        0, 0, 0, 1);

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(mult(mv2, mv)));
        deathStar.draw();
        deathStarDoTick();
    }

    requestAnimFrame(render);
}

var deathStarDoTick = function() {
    if(FIRING && deathStarTick >= deathStarMaxTick){
        FIRING = false;
        FIRED = true;
        planets[4].explode();
        deathStarTick -= deathStarTickSize;
        deathStarFireTime = new Date();
    } else if(FIRED && deathStarTick <= 0){
        deathStarTick = 0;
        FIRED = false;
    } else if(deathStarTick >= deathStarMaxTick){
        FIRED = false;
    } else if (FIRING) {
        deathStarTick += deathStarTickSize;
    } else if (FIRED && hasCooledDown()) {
        deathStarTick -= deathStarTickSize;
    }
}

var hasCooledDown = function(){
    var current = new Date();
    if(current - deathStarFireTime >= deathStarCooldown){
        return true;
    }
    return false;
}

var deathStarActive = function(){
    return FIRED || FIRING;
}

window.onkeydown = function(e) {
    if(deathStarActive()){
        SCALE = 1;
        CAMERA_X = 0;
        CAMERA_Y = 0;
        return;
    }
    var step = .1;
    switch (e.keyCode) {
        case 33:
            SCALE += step;
            render();
            break;
        case 34:
            SCALE -= step;
            render();
            break;
        case 37:
            CAMERA_X -= step;
            render();
            break;
        case 38:
            CAMERA_Y += step;
            render();
            break;
        case 39:
            CAMERA_X += step;
            render();
            break;
        case 40:
            CAMERA_Y -= step;
            render();
            break;
        case 32:
            var deathStarMusic = new Audio('trap.mp3');
            deathStarMusic.play();
            planets[4].explode();
            FIRING = true;
            break;
    }
}

function Planet(planetNum, radius, texture) {
    var coords = getSphereCenter(planetNum);
    this.centerX = coords[0];
    this.centerY = coords[1];
    this.centerZ = coords[2];
    this.radius = radius;
    this.texture = texture
    this.isAsteroid = false;
    this.isExplostion = false;
    if (planetNum == 0) {
        this.isSun = 1;
    } else {
        this.isSun = 0;
    }
    this.vertices = [];
    this.normals = [];
    this.texCords = [];
    this.create = createSpaceObject;
    this.draw = drawPlanet;
    this.explode = planetExplode;
    if (planetNum == 3) {
        this.hasRings = true;
    } else {
        this.hasRings = false;
    }
}

function DeathStar(texture) {
    this.centerX = DS_X;
    this.centerY = DS_Y;
    this.centerZ = DS_Z;
    this.radius = DS_RAD;
    this.texture = deathStarTexture;
    this.vertices = [];
    this.normals = [];
    this.texCords = [];
    this.create = createSpaceObject;
    this.draw = drawPlanet;
    this.isSun = false;
    this.isAsteroid = false;
    this.isExplostion = false;
}

function planetExplode() {
    planets.splice(this.planetNum, 1);
    explosions.push(new Explosion(explosionTexture, this.texture, this.centerX, this.centerY, this.centerZ));
}

function Explosion(texture, planetTexture, x, y, z) {
    this.centerX = x;
    this.centerY = y;
    this.centerZ = z;

    this.time = 0;

    this.texture = texture;
    this.isAsteroid = false;
    this.isExplostion = true;
    this.isSun = false;
    this.radius = EXP_RAD;
    this.vertices = [];
    this.normals = [];
    this.texCords = [];
    this.create = createSpaceObject;
    this.draw = drawPlanet;
    this.update = explosionUpdate;
    this.planetTexture = planetTexture;
}

function explosionUpdate() {
    this.radius += (EXP_TIME - this.time) / 1000;
    this.create();
    this.time += 1;
}

function ExplosionAsteroid(texture, x, y, z) {
    this.centerX = x;
    this.centerY = y;
    this.centerZ = z;
    this.velocityX = -.03 + Math.random() * .06;
    this.velocityY = -.03 + Math.random() * .06; // +1 to velocities
    this.velocityZ = .05;
    this.time = 0;

    this.texture = texture;
    this.isAsteroid = true;
    this.isExplostion = false;
    this.isSun = false;
    this.radius = ASTEROID_RAD;
    this.vertices = [];
    this.normals = [];
    this.texCords = [];
    this.create = createSpaceObject;
    this.draw = drawPlanet;
    this.update = asteroidUpdate;
    this.fromExp = true;
}


function Asteroid(astNum, texture) {
    this.pos = astNum;
    var coords = getAsteroidCoor();
    this.centerX = coords[0];
    this.centerY = coords[1];
    this.centerZ = coords[2];
    if (ASTEROID_SIDES) {
        var velocity = Math.random() / 20;
        this.velocityX = velocity;
        this.velocityY = velocity;
        this.velocityZ = 0;
    }
    if (ASTEROID_BACK) {
        this.velocityX = 1 + .04;
        this.velocityY = 1 + .04; // +1 to velocities
        this.velocityZ = 1 + .05;
    }

    this.texture = texture;
    this.isAsteroid = true;
    this.isExplostion = false;
    this.isSun = false;
    this.radius = ASTEROID_RAD;
    this.vertices = [];
    this.normals = [];
    this.texCords = [];
    this.create = createSpaceObject;
    this.draw = drawPlanet;
    this.update = asteroidUpdate;
    this.fromExp = false;
    this.time = 0;
}

function getAsteroidCoor() {
    if (ASTEROID_SIDES) {
        if (Math.random() * 10 > 5) {
            x = -1.3 - Math.random() / 2;
            y = 0;
        } else {
            x = 0;
            y = -1.3 - Math.random() / 2;
        }

        z = 0;
    }

    if (ASTEROID_BACK) {
        x = -.1 + Math.random() / 5;
        y = -.1 + Math.random() / 5;
        z = 0;
    }

    return [x, y, z];
}

function asteroidUpdate() {
    if (!this.fromExp) {
        this.centerX += this.velocityX;
        this.centerY += this.velocityY;
        // this.centerZ+=this.velocityZ;
        for (var i = 0; i < this.vertices.length; i++) {
            this.vertices[i] = [this.vertices[i][0] + this.velocityX, this.vertices[i][1] + this.velocityY, this.vertices[i][2] + this.velocityZ, this.vertices[i][3]];
        }
    }
    if (this.fromExp) {
        this.time += 1;
        for (var i = 0; i < this.vertices.length; i++) {
            this.vertices[i] = [this.vertices[i][0] + this.velocityX, this.vertices[i][1] + this.velocityY, this.vertices[i][2] + this.velocityZ, this.vertices[i][3]];
        }
    }
}

function createSpaceObject() {
    if (this.isAsteroid) {
        var latitudeBands = 8;
        var longitudeBands = 8;
    } else if (this.isExplostion) {
        var latitudeBands = 12;
        var longitudeBands = 12;
    } else {
        var latitudeBands = 20;
        var longitudeBands = 20;
    }
    var vertexPositionData = [];
    var normals = [];

    if (this.isAsteroid) {
        var newRadius = this.radius * Math.random();
    }

    if (this.isExplostion) {
        var newRadius = this.radius;
    }

    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        var tempVertices = [];
        var tempNormals = [];
        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;

            if (this.isExplostion) {
                var temp = Math.random() * 10;

                if (temp < 2) {
                    newRadius += EXP_RAND;
                }

                if (temp > 8) {
                    newRadius -= EXP_RAND;
                }

                this.radius = newRadius;
            }

            if (this.isAsteroid) {
                var temp = Math.random() * 10;

                if (temp < 2) {
                    newRadius += ASTEROID_RAND;
                }

                if (temp > 8) {
                    newRadius -= ASTEROID_RAND;
                }

                this.radius = newRadius;
            }

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

    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
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

function drawPlanet() {
    drawElement(this.vertices, this.texCords, this.texture, this.normals, this.isSun);
    var vertices = [];
    var texCords = [];
    var normals = [];

    var insideRad = .05;
    var outsideRad = .1;
    var steps = 50;
    var deltaTheta = Math.PI * 2 / steps;

    if (this.hasRings) {
        for (var i = 0; i < steps; i++) {
            var angle1 = deltaTheta * i;
            var angle2 = deltaTheta * (i + 1);
            var bottom1 = vec4(insideRad * Math.cos(angle1) + this.centerX, insideRad * Math.sin(angle1) + this.centerY, insideRad * Math.cos(angle1) + this.centerZ, 1);
            var top1 = vec4(outsideRad * Math.cos(angle1) + this.centerX, outsideRad * Math.sin(angle1) + this.centerY, outsideRad * Math.cos(angle1) + this.centerZ, 1);
            var bottom2 = vec4(insideRad * Math.cos(angle2) + this.centerX, insideRad * Math.sin(angle2) + this.centerY, insideRad * Math.cos(angle2) + this.centerZ, 1);
            var top2 = vec4(outsideRad * Math.cos(angle2) + this.centerX, outsideRad * Math.sin(angle2) + this.centerY, outsideRad * Math.cos(angle2) + this.centerZ, 1);
            vertices.push(bottom1, top1, bottom2);
            normals.push(bottom1, top1, bottom2);
            texCords.push(vec2(1, 1), vec2(0, 1), vec2(1, 0));
            vertices.push(top1, top2, bottom2);
            normals.push(top1, top2, bottom2);
            texCords.push(vec2(0, 1), vec2(0, 0), vec2(1, 0));
        }
        drawElement(vertices, texCords, saturnRingTexture, normals, false);
    }
}

var drawElement = function(vertices, texCords, texture, normals, isSun) {
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(normals));
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(texCords));
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
}

function initializeThetas() {
    var i;
    for (i = 0; i < NUM_PLANETS; i++) {
        thetas[i] = 360 * Math.random();
    }

}

//to animate planets about the sun
function incrementThetas() {
    var i;
    for (i = 0; i < NUM_PLANETS; i++) {
        thetas[i] = thetas[i] + 1.0 * ROTATION_SPEED;
    }
}

//calculate the new center after thetas have changed
function getSphereCenter(planetNum) {
    var x = MAX_DISTANCES_FROM_SUN[planetNum] * SCALE_FACTOR_DISTANCE * Math.cos(thetas[planetNum]);
    var z = MIN_DISTANCES_FROM_SUN[planetNum] * SCALE_FACTOR_DISTANCE * Math.sin(thetas[planetNum]);
    var y = Math.sqrt(x * x + z * z) * Math.sin(INCLINATIONS[planetNum]);
    return [x, y, z];
}