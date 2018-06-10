/*
Names: Isaiah Scheel, Taylor Lunde, Justin deMattos
Assignment: Final Project
Course/Semester: CS 412 - Spring Semester
Instructor: Dr. Wolff
Date: 22 May 2018
Sources Consulted: See Proposal document
*/

// The WebGL object
var gl;

// The file data
var fileData = [];
var fileName = "ss_normal_168yrs.txt";

// Slider stuff
var slider = document.getElementById("myRange");
var output = document.getElementById("test");

// Scale for solar system size
var scale = 11;

// Place holder for time
var timeHold = 0;

// Axis rotations boolean
var spin = false;

//Time for world
var time=0;
var maxTime=0;

//Time step
var tstep=0;

//Texture coordinates for sphere
var texts = 1;

//Show grid
var gridShow=true;

// The HTML canvas
var canvas;

var grid;    // The reference grid
var axes;    // The coordinate axes
var camera;  // The camera

//Planet View Modes
sunView = false;
mercuryView = false;
venusView = false;
earthView = false;
marsView = false;
jupiterView = false;
saturnView = false;
uranusView = false;
neptuneView = false;

// Uniform variable locations
var uni = {
    uModel: null,
    uView: null,
    uProj: null,
    uColor: null,
    uEmissive: null,
    uAmbient: null,
    uDiffuse: null,
    uSpecular: null,
    uShine: null,
    uLightPos: null,
    uLightIntensity: null,
    uAmbientLight: null,
};

//Variable used to track the location of the light source
var lightLoc = {
    x:0,
    y:3,
    z:0,
    distance:5, //distance from the y axis (world)
    lightMode:true, //variable used for local mode and camera mode
    theta:0 //variable for angle changes around y axis
};

//Variables for camera positions in body view
var sunCam = {
    radius:7,
    theta:Math.PI,
    phi:Math.PI/2
};

var mercuryCam = {
    radius:2,
    theta:Math.PI,
    phi: Math.PI/2
}

var venusCam = {
    radius:3,
    theta:Math.PI,
    phi: Math.PI/2
}

var earthCam = {
    radius:3,
    theta:Math.PI,
    phi: Math.PI/2
}

var marsCam = {
    radius:3,
    theta:Math.PI,
    phi: Math.PI/2
}

var jupiterCam = {
    radius:17,
    theta:Math.PI,
    phi: Math.PI/2
}

var saturnCam = {
    radius:17,
    theta:Math.PI,
    phi: Math.PI/2
}

var uranusCam = {
    radius:10,
    theta:Math.PI,
    phi: Math.PI/2
}

var neptuneCam = {
    radius:10,
    theta:Math.PI,
    phi: Math.PI/2
}

//Variable used to track sun movement
var sunLoc = {
    x:fileData[timeHold + 3] * scale,
    y:fileData[timeHold + 4] * scale,
    phi: 0
};

//Variable used to track location of Mercury
var mercuryLoc = {
    x:fileData[timeHold + 5] * scale,
    y:fileData[timeHold + 6] * scale,
    phi: 0
};

//Variable used to track location of Venus
var venusLoc = {
    x:fileData[timeHold + 7] * scale,
    y:fileData[timeHold + 8] * scale,
    phi: 0
};

//Variable used to track location of Earth
var earthLoc = {
    x:fileData[timeHold + 9] * scale,
    y:fileData[timeHold + 10] * scale,
    phi: 0
};

//Variable used to track location of Mars
var marsLoc = {
    x:fileData[timeHold + 11] * scale,
    y:fileData[timeHold + 12] * scale,
    phi: 0
};

//Variable used to track location of Jupiter
var jupiterLoc = {
    x:fileData[timeHold + 13] * scale,
    y:fileData[timeHold + 14] * scale,
    phi: 0
};

//Variable used to track location of Saturn
var saturnLoc = {
    x:fileData[timeHold + 15] * scale,
    y:fileData[timeHold + 16] * scale,
    phi: 0
};

//Variable used to track location of Uranus
var uranusLoc = {
    x:fileData[timeHold + 17] * scale,
    y:fileData[timeHold + 18] * scale,
    phi: 0
};

//Variable used to track location of Neptune
var neptuneLoc = {
    x:fileData[timeHold + 19] * scale,
    y:fileData[timeHold + 20] * scale,
    phi: 0
};

//Varible to play/pause animation
var pause = false;

/**
 * Initialize the WebGL context, load/compile shaders, and initialize our shapes.
 */
var init = function() {
    
    // Set up WebGL
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Set the viewport transformation
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set the background color to black
    gl.clearColor(0.7, 0.7, 0.7, 1.0);
    
    // Enable the z-buffer
    gl.enable(gl.DEPTH_TEST);

    // Load and compile shaders
    program = Utils.loadShaderProgram(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Find the uniform variable locations
    uni.uModel = gl.getUniformLocation(program, "uModel");
    uni.uView = gl.getUniformLocation(program, "uView");
    uni.uProj = gl.getUniformLocation(program, "uProj");
    uni.uColor = gl.getUniformLocation(program, "uColor");
    uni.uEmissive = gl.getUniformLocation(program, "uEmissive");
    uni.uAmbient = gl.getUniformLocation(program, "uAmbient");
    uni.uDiffuse = gl.getUniformLocation(program, "uDiffuse");
    uni.uSpecular = gl.getUniformLocation(program, "uSpecular");
    uni.uShine = gl.getUniformLocation(program, "uShine");
    uni.uLightPos = gl.getUniformLocation(program, "uLightPos");
    uni.uLightIntensity = gl.getUniformLocation(program, "uLightIntensity");
    uni.uAmbientLight = gl.getUniformLocation(program, "uAmbientLight");
    uni.uHasDiffuseTex = gl.getUniformLocation(program, "uHasDiffuseTex");
    uni.uDiffuseTex = gl.getUniformLocation(program, "uDiffuseTex");
    uni.uNoMat = gl.getUniformLocation(program, "uNoMat");

    //Set uniforms that do not change often
    gl.uniform3fv(uni.uLightIntensity,vec3.fromValues(0.75, 0.75, 0.75));
    gl.uniform3fv(uni.uAmbientLight, vec3.fromValues(0.25, 0.25, 0.25));

    //Set uniform for texture value holder
    gl.uniform1i(uni.uDiffuseTex, 0);

    //Set uniform for NoMat 
    gl.uniform1f(uni.uNoMat, 0);

    // Initialize the camera
    camera = new Camera( canvas.width / canvas.height );

    fileData = readIn(fileName);
    // sunLoc.x = fileData[timeHold + 3] * scale;
    // sunLoc.y = fileData[timeHold + 4] * scale;
    mercuryLoc.x = fileData[timeHold + 4] * scale;
    mercuryLoc.y = fileData[timeHold + 5] * scale;
    venusLoc.x = fileData[timeHold + 6] * scale;
    venusLoc.y = fileData[timeHold + 7] * scale;
    earthLoc.x = fileData[timeHold + 8] * scale;
    earthLoc.y = fileData[timeHold + 9] * scale;
    marsLoc.x = fileData[timeHold + 10] * scale;
    marsLoc.y = fileData[timeHold + 11] * scale;
    jupiterLoc.x = fileData[timeHold + 12] * scale;
    jupiterLoc.y = fileData[timeHold + 13] * scale;
    saturnLoc.x = fileData[timeHold + 14] * scale;
    saturnLoc.y = fileData[timeHold + 15] * scale;
    uranusLoc.x = fileData[timeHold + 16] * scale;
    uranusLoc.y = fileData[timeHold + 17] * scale;
    neptuneLoc.x = fileData[timeHold + 18] * scale;
    neptuneLoc.y = fileData[timeHold + 19] * scale;

    tstep = fileData[20] - fileData[0];
    maxTime = fileData.length-20;

    // Initialize our shapes
    Shapes.init(gl,fileData,scale);
    grid = new Grid(gl, 20.0, 20, Float32Array.from([0.7,0.7,0.7]));
    axes = new Axes(gl, 2.5, 0.05);

    setupEventHandlers();

    // Load textures
    Promise.all( [
            Utils.loadTexture(gl, "media/checker-32x32-1024x1024.png"),
            Utils.loadTexture(gl, "media/sun.jpg"),
            Utils.loadTexture(gl, "media/mercury.jpg"),
            Utils.loadTexture(gl, "media/venus.jpg"),
            Utils.loadTexture(gl, "media/earth.jpg"),
            Utils.loadTexture(gl, "media/mars.jpg"),
            Utils.loadTexture(gl, "media/jupiter.jpg"),
            Utils.loadTextureMip(gl, "media/stars2.png"),
            Obj.load(gl, "media/saturn.obj"), //Load saturn obj file (Obtained through 3D warehouse)
            Utils.loadTexture(gl, "media/saturn-rings.png"), //From 3D warehouse
            Utils.loadTexture(gl, "media/material6.jpg"), //From 3D warehouse
            Utils.loadTexture(gl, "media/uranus.jpg"),
            Utils.loadTexture(gl, "media/neptune.jpg")

        ]).then( function(values) {
            //Store textures in Textures object
            Textures["checker-32x32-1024x1024.png"] = values[0];
            Textures["sun.jpg"] = values[1];
            Textures["mercury.jpg"] = values[2];
            Textures["venus.jpg"] = values[3];
            Textures["earth.jpg"] = values[4];
            Textures["mars.jpg"] = values[5];
            Textures["jupiter.jpg"] = values[6];
            Textures["stars.png"] = values[7];
            Shapes.saturn = values[8]; //From 3D warehouse
            Textures["saturn-rings.png"] = values[9];
            Textures["material6.jpg"] = values[10];
            Textures["uranus.jpg"] = values[11];
            Textures["neptune.jpg"] = values[12];
            //Start animation sequence
            render();
        });
};

/**
 * Render the scene!
 */
var render = function() {
    // Request another draw
    window.requestAnimFrame(render, canvas);

    // Update camera when in fly mode
    updateCamera();

    // Clear the color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set projection and view matrices 
    gl.uniformMatrix4fv(uni.uView, false, camera.viewMatrix());
    gl.uniformMatrix4fv(uni.uProj, false, camera.projectionMatrix());

    //Draw Sky Box
    model=mat4.create();
    gl.uniform1f(uni.uNoMat, 1); //Don't take material into account when shading
    mat4.identity(model);
    mat4.scale(model, model, vec3.fromValues(2000, 2000, 2000));
    gl.uniformMatrix4fv(uni.uModel,false,model);
    Shapes.skybox.material.diffuseTexture = "stars.png";
    Shapes.skybox.material.emissive = vec3.fromValues(0,0,0);
    Shapes.skybox.render(gl, uni, Shapes.skybox.material);
    gl.uniform1f(uni.uNoMat, 0); //Reset to default

    //drawAxesAndGrid();

    //Add time only if not paused
    if(time == fileData[maxTime])
        pause = true;
    if(pause==false){
        timeHold+=20
        time = fileData[timeHold];
        output.innerHTML = time.toFixed(2);
        slider.value = timeHold;
        //console.log(slider.value);
    }

    drawScene();

};

/**
 * Draw the objects in the scene.  
 */
var drawScene = function() {
    mercuryLoc.x = fileData[timeHold + 4] * scale;
    mercuryLoc.y = fileData[timeHold + 5] * scale;
    venusLoc.x = fileData[timeHold + 6] * scale;
    venusLoc.y = fileData[timeHold + 7] * scale;
    earthLoc.x = fileData[timeHold + 8] * scale;
    earthLoc.y = fileData[timeHold + 9] * scale;
    marsLoc.x = fileData[timeHold + 10] * scale;
    marsLoc.y = fileData[timeHold + 11] * scale;
    jupiterLoc.x = fileData[timeHold + 12] * scale;
    jupiterLoc.y = fileData[timeHold + 13] * scale;
    saturnLoc.x = fileData[timeHold + 14] * scale;
    saturnLoc.y = fileData[timeHold + 15] * scale;
    uranusLoc.x = fileData[timeHold + 16] * scale;
    uranusLoc.y = fileData[timeHold + 17] * scale;
    neptuneLoc.x = fileData[timeHold + 18] * scale;
    neptuneLoc.y = fileData[timeHold + 19] * scale;

    if(pause==false){
        mercuryCam.theta+=0.055;
        venusCam.theta+=0.021;
        earthCam.theta+=0.0125;
        marsCam.theta+=0.0067;
        jupiterCam.theta+=0.00105;
        saturnCam.theta+=0.00045;
        uranusCam.theta+=0.0002;
        neptuneCam.theta+=0.0001
    }

    //Draw the orbits if checkbox selected
    if(gridShow==true){

        //Draw Mercury orbit
        model1 = mat4.create();
        gl.uniformMatrix4fv(uni.uModel,false,model1);
        Shapes.orbit1.render(gl,uni,Shapes.orbit1.material);
    
        //Draw Venus orbit
        model1 = mat4.create();
        gl.uniformMatrix4fv(uni.uModel,false,model1);
        Shapes.orbit2.render(gl,uni,Shapes.orbit1.material);
    
        //Draw Earth orbit
        model1 = mat4.create();
        gl.uniformMatrix4fv(uni.uModel,false,model1);
        Shapes.orbit3.render(gl,uni,Shapes.orbit1.material);

        //Draw Mars orbit
        model1 = mat4.create();
        gl.uniformMatrix4fv(uni.uModel,false,model1);
        Shapes.orbit4.render(gl,uni,Shapes.orbit1.material);

        //Draw Jupiter orbit
        model1 = mat4.create();
        gl.uniformMatrix4fv(uni.uModel,false,model1);
        Shapes.orbit5.render(gl,uni,Shapes.orbit1.material);

        //Draw Saturn orbit
        model1 = mat4.create();
        gl.uniformMatrix4fv(uni.uModel,false,model1);
        Shapes.orbit6.render(gl,uni,Shapes.orbit1.material);

        //Draw Uranus orbit
        model1 = mat4.create();
        gl.uniformMatrix4fv(uni.uModel,false,model1);
        Shapes.orbit7.render(gl,uni,Shapes.orbit1.material);

        //Draw Neptune orbit
        model1 = mat4.create();
        gl.uniformMatrix4fv(uni.uModel,false,model1);
        Shapes.orbit8.render(gl,uni,Shapes.orbit1.material);
    }

    //If not paused, rotate objects
    if(spin == true){
        if(pause==false){
            //Days:
            sunLoc.phi -= (Math.PI/2)*tstep/.023287671;
            earthLoc.phi -= (Math.PI/2)*tstep/0.0006849315;
            mercuryLoc.phi -=(Math.PI/2)*tstep/0.0401683786;
            venusLoc.phi -=(Math.PI/2)*tstep/0.0799657526;
            marsLoc.phi -=(Math.PI/2)*tstep/0.0007025304;
            jupiterLoc.phi -=(Math.PI/2)*tstep/0.0002834855;
            saturnLoc.phi -=(Math.PI/2)*tstep/0.0003053653;
            uranusLoc.phi -=(Math.PI/2)*tstep/0.0004918189;
            neptuneLoc.phi -=(Math.PI/2)*tstep/0.0004594748;

        }
    }
    else{
        if(pause==false){
            sunLoc.phi -= Math.PI/100;
            earthLoc.phi -= Math.PI/100;
            mercuryLoc.phi -= Math.PI/100;
            venusLoc.phi -= Math.PI/100;
            marsLoc.phi -= Math.PI/100;
            jupiterLoc.phi -= Math.PI/100;
            saturnLoc.phi -= Math.PI/100;
            uranusLoc.phi -= Math.PI/100;
            neptuneLoc.phi -= Math.PI/100;
        }
    }
    
    //Start drawing shapes
    model = mat4.create();
    view = camera.viewMatrix();
    gl.uniform3fv(uni.uLightPos, vec3.fromValues(view[12], view[13], view[14]));

    //Move camera if Sun view is on
    if(sunView == true){
        let x = sunCam.radius*Math.cos(sunCam.theta)*Math.sin(sunCam.phi);
        let y = sunCam.radius*Math.cos(sunCam.phi);
        let z = sunCam.radius*Math.sin(sunCam.theta)*Math.sin(sunCam.phi);
        pos = vec3.fromValues(x,y,z);
        at = vec3.fromValues(0,0,0);
        up = vec3.fromValues(0,-1,0);
        camera.lookAt(pos,at,up);
    }

    //Draw Sun
    gl.uniform1f(uni.uNoMat, 1); //Don't take material into account when shading
    mat4.identity(model);
    mat4.scale(model, model, vec3.fromValues(2, 2, 2));
    mat4.rotateY(model, model, sunLoc.phi);
    gl.uniformMatrix4fv(uni.uModel,false,model); 
    Shapes.sphere.material.diffuseTexture = "sun.jpg"; //Doesn't work because emissive component highest
    Shapes.sphere.render(gl, uni, Shapes.sphere.material);
    Shapes.sphere.material.diffuseTexture = null;
    gl.uniform1f(uni.uNoMat, 0); //Reset to default

    //Move camera if Mercury view is on
    if(mercuryView == true){
        let x = mercuryCam.radius*Math.cos(mercuryCam.theta)*Math.sin(mercuryCam.phi);
        let y = mercuryCam.radius*Math.cos(mercuryCam.phi);
        let z = mercuryCam.radius*Math.sin(mercuryCam.theta)*Math.sin(mercuryCam.phi);
        matrix = mat4.create();
        mat4.translate(matrix,matrix,vec3.fromValues(x,y,z));
        mat4.translate(matrix,matrix,vec3.fromValues(mercuryLoc.x,0,mercuryLoc.y));
        pos = vec3.fromValues(matrix[12], matrix[13], matrix[14]);
        at = vec3.fromValues(mercuryLoc.x, 0, mercuryLoc.y);
        up = vec3.fromValues(0,-1,0);
        camera.lookAt(pos,at,up);
    }

    //Draw Mercury
    mat4.identity(model);
    mat4.fromTranslation(model,vec3.fromValues(mercuryLoc.x, 0, mercuryLoc.y));
    mat4.rotateZ(model, model, 0.03*Math.PI/180);
    mat4.rotateY(model, model, mercuryLoc.phi);
    mat4.scale(model, model, vec3.fromValues(0.15, 0.15, 0.15));
    gl.uniformMatrix4fv(uni.uModel,false,model);
    gl.uniform3fv(uni.uColor, vec3.fromValues(0, 1, 0)); //Change color to yellow
    Shapes.sphere.material.diffuse = vec3.fromValues(0, 0.3, 0.3); //Allow for some color diffuse
    Shapes.sphere.material.emissive = vec3.fromValues(0.1, 0.1, 0); //Allow for slight emissive
    Shapes.sphere.material.diffuseTexture = "mercury.jpg";
    Shapes.sphere.render(gl, uni, Shapes.sphere.material);

    //Move camera if Venus view is on
    if(venusView == true){
        let x = venusCam.radius*Math.cos(venusCam.theta)*Math.sin(venusCam.phi);
        let y = venusCam.radius*Math.cos(venusCam.phi);
        let z = venusCam.radius*Math.sin(venusCam.theta)*Math.sin(venusCam.phi);
        matrix = mat4.create();
        mat4.translate(matrix,matrix,vec3.fromValues(x,y,z));
        mat4.translate(matrix,matrix,vec3.fromValues(venusLoc.x,0,venusLoc.y));
        pos = vec3.fromValues(matrix[12], matrix[13], matrix[14]);
        at = vec3.fromValues(venusLoc.x, 0, venusLoc.y);
        up = vec3.fromValues(0,-1,0);
        camera.lookAt(pos,at,up);
    }

    //Draw Venus
    mat4.identity(model);
    mat4.fromTranslation(model,vec3.fromValues(venusLoc.x, 0, venusLoc.y));
    mat4.rotateZ(model, model, 2.64*Math.PI/180);
    mat4.rotateY(model, model, venusLoc.phi);
    mat4.scale(model, model, vec3.fromValues(0.37, 0.37, 0.37));
    gl.uniformMatrix4fv(uni.uModel,false,model);
    Shapes.sphere.material.diffuseTexture = "venus.jpg";
    Shapes.sphere.render(gl, uni, Shapes.sphere.material);

    //Move camera if Earth view is on
    if(earthView == true){
        let x = earthCam.radius*Math.cos(earthCam.theta)*Math.sin(earthCam.phi);
        let y = earthCam.radius*Math.cos(earthCam.phi);
        let z = earthCam.radius*Math.sin(earthCam.theta)*Math.sin(earthCam.phi);
        matrix = mat4.create();
        mat4.translate(matrix,matrix,vec3.fromValues(x,y,z));
        mat4.translate(matrix,matrix,vec3.fromValues(earthLoc.x,0,earthLoc.y));
        pos = vec3.fromValues(matrix[12], matrix[13], matrix[14]);
        at = vec3.fromValues(earthLoc.x, 0, earthLoc.y);
        up = vec3.fromValues(0,-1,0);
        camera.lookAt(pos,at,up);
    }

    //Draw Earth
    mat4.identity(model);
    mat4.fromTranslation(model,vec3.fromValues(earthLoc.x, 0, earthLoc.y));
    mat4.rotateZ(model, model, 23.4*Math.PI/180);
    mat4.rotateY(model, model, earthLoc.phi);
    mat4.scale(model, model, vec3.fromValues(0.39, 0.39, 0.39));
    gl.uniformMatrix4fv(uni.uModel,false,model);
    Shapes.sphere.material.diffuseTexture = "earth.jpg";
    Shapes.sphere.render(gl, uni, Shapes.sphere.material);

    //Move camera if Mars view is on
    if(marsView == true){
        let x = marsCam.radius*Math.cos(marsCam.theta)*Math.sin(marsCam.phi);
        let y = marsCam.radius*Math.cos(marsCam.phi);
        let z = marsCam.radius*Math.sin(marsCam.theta)*Math.sin(marsCam.phi);
        matrix = mat4.create();
        mat4.translate(matrix,matrix,vec3.fromValues(x,y,z));
        mat4.translate(matrix,matrix,vec3.fromValues(marsLoc.x,0,marsLoc.y));
        pos = vec3.fromValues(matrix[12], matrix[13], matrix[14]);
        at = vec3.fromValues(marsLoc.x, 0, marsLoc.y);
        up = vec3.fromValues(0,-1,0);
        camera.lookAt(pos,at,up);
    }

    //Draw Mars
    mat4.identity(model);
    mat4.fromTranslation(model,vec3.fromValues(marsLoc.x, 0, marsLoc.y));
    mat4.rotateZ(model, model, 25.19*Math.PI/180);
    mat4.rotateY(model, model, marsLoc.phi);
    mat4.scale(model, model, vec3.fromValues(0.24, 0.24, 0.24));
    gl.uniformMatrix4fv(uni.uModel,false,model);
    Shapes.sphere.material.diffuseTexture = "mars.jpg";
    Shapes.sphere.render(gl, uni, Shapes.sphere.material);

     //Move camera if Jupiter view is on
     if(jupiterView == true){
        let x = jupiterCam.radius*Math.cos(jupiterCam.theta)*Math.sin(jupiterCam.phi);
        let y = jupiterCam.radius*Math.cos(jupiterCam.phi);
        let z = jupiterCam.radius*Math.sin(jupiterCam.theta)*Math.sin(jupiterCam.phi);
        matrix = mat4.create();
        mat4.translate(matrix,matrix,vec3.fromValues(x,y,z));
        mat4.translate(matrix,matrix,vec3.fromValues(jupiterLoc.x,0,jupiterLoc.y));
        pos = vec3.fromValues(matrix[12], matrix[13], matrix[14]);
        at = vec3.fromValues(jupiterLoc.x, 0, jupiterLoc.y);
        up = vec3.fromValues(0,-1,0);
        camera.lookAt(pos,at,up);
    }

    //Draw Jupiter
     mat4.identity(model);
     mat4.fromTranslation(model,vec3.fromValues(jupiterLoc.x, 0, jupiterLoc.y));
     mat4.rotateZ(model, model, 3.13*Math.PI/180);
     mat4.rotateY(model, model, jupiterLoc.phi);
     mat4.scale(model, model, vec3.fromValues(4.3, 4.3, 4.3));
     gl.uniformMatrix4fv(uni.uModel,false,model);
     Shapes.sphere.material.diffuseTexture = "jupiter.jpg";
     Shapes.sphere.render(gl, uni, Shapes.sphere.material);

    //Move camera if Saturn view is on
    if(saturnView == true){
        let x = saturnCam.radius*Math.cos(saturnCam.theta)*Math.sin(saturnCam.phi);
        let y = saturnCam.radius*Math.cos(saturnCam.phi);
        let z = saturnCam.radius*Math.sin(saturnCam.theta)*Math.sin(saturnCam.phi);
        matrix = mat4.create();
        mat4.translate(matrix,matrix,vec3.fromValues(x,y,z));
        mat4.translate(matrix,matrix,vec3.fromValues(saturnLoc.x,0,saturnLoc.y));
        pos = vec3.fromValues(matrix[12], matrix[13], matrix[14]);
        at = vec3.fromValues(saturnLoc.x, 0, saturnLoc.y);
        up = vec3.fromValues(0,-1,0);
        camera.lookAt(pos,at,up);
    }

    //Draw Saturn
    mat4.identity(model);
    mat4.fromTranslation(model,vec3.fromValues(saturnLoc.x, -1.5, saturnLoc.y));
    mat4.rotateZ(model, model, 26.73*Math.PI/180);
    mat4.rotateY(model, model, saturnLoc.phi);
    mat4.scale(model, model, vec3.fromValues(3.7, 3.7, 3.7));
    gl.uniformMatrix4fv(uni.uModel,false,model);
    Shapes.saturn.render(gl, uni, Shapes.sphere.material);

     //Move camera if Uranus view is on
     if(uranusView == true){
        let x = uranusCam.radius*Math.cos(uranusCam.theta)*Math.sin(uranusCam.phi);
        let y = uranusCam.radius*Math.cos(uranusCam.phi);
        let z = uranusCam.radius*Math.sin(uranusCam.theta)*Math.sin(uranusCam.phi);
        matrix = mat4.create();
        mat4.translate(matrix,matrix,vec3.fromValues(x,y,z));
        mat4.translate(matrix,matrix,vec3.fromValues(uranusLoc.x,0,uranusLoc.y));
        pos = vec3.fromValues(matrix[12], matrix[13], matrix[14]);
        at = vec3.fromValues(uranusLoc.x, 0, uranusLoc.y);
        up = vec3.fromValues(0,-1,0);
        camera.lookAt(pos,at,up);
    }

    //Draw Uranus
     mat4.identity(model);
     mat4.fromTranslation(model,vec3.fromValues(uranusLoc.x, 0, uranusLoc.y));
     mat4.rotateZ(model, model, 82.23*Math.PI/180);
     mat4.rotateY(model, model, uranusLoc.phi);
     mat4.scale(model, model, vec3.fromValues(1.57, 1.57, 1.57));
     gl.uniformMatrix4fv(uni.uModel,false,model);
     Shapes.sphere.material.diffuseTexture = "uranus.jpg";
     Shapes.sphere.render(gl, uni, Shapes.sphere.material);

    //Move camera if Neptune view is on
    if(neptuneView == true){
        let x = neptuneCam.radius*Math.cos(neptuneCam.theta)*Math.sin(neptuneCam.phi);
        let y = neptuneCam.radius*Math.cos(neptuneCam.phi);
        let z = neptuneCam.radius*Math.sin(neptuneCam.theta)*Math.sin(neptuneCam.phi);
        matrix = mat4.create();
        mat4.translate(matrix,matrix,vec3.fromValues(x,y,z));
        mat4.translate(matrix,matrix,vec3.fromValues(neptuneLoc.x,0,neptuneLoc.y));
        pos = vec3.fromValues(matrix[12], matrix[13], matrix[14]);
        at = vec3.fromValues(neptuneLoc.x, 0, neptuneLoc.y);
        up = vec3.fromValues(0,-1,0);
        camera.lookAt(pos,at,up);
    }

    //Draw Neptune
    mat4.identity(model);
    mat4.fromTranslation(model,vec3.fromValues(neptuneLoc.x, 0, neptuneLoc.y));
    mat4.rotateZ(model, model, 28.32*Math.PI/180);
    mat4.rotateY(model, model, neptuneLoc.phi);
    mat4.scale(model, model, vec3.fromValues(1.53, 1.53, 1.53));
    gl.uniformMatrix4fv(uni.uModel,false,model);
    Shapes.sphere.material.diffuseTexture = "neptune.jpg";
    Shapes.sphere.render(gl, uni, Shapes.sphere.material);

};

/**
 * Draws the reference grid and coordinate axes.
 */
var drawAxesAndGrid = function() {
    // Set model matrix to identity
    gl.uniformMatrix4fv(uni.uModel, false, mat4.create());
    // Draw grid
    grid.render(gl,uni);
    // Draw Axes
    axes.render(gl,uni);
};

//////////////////////////////////////////////////
// Event handlers
//////////////////////////////////////////////////

/**
 * An object used to represent the current state of the mouse.
 */
mouseState = {
    prevX: 0,     // position at the most recent previous mouse motion event
    prevY: 0, 
    x: 0,          // Current position
    y: 0,      
    deltaX: 0,     // the change in the mouses x direction when dragging
    deltaY: 0,     // the change in the mouses y direction when dragging
    button: 0,     // Left = 0, middle = 1, right = 2
    down: false,   // Whether or not a button is down
    wheelDelta: 0  // How much the mouse wheel was moved
};
var cameraMode = 0;          // Mouse = 0, Fly = 1, Mercury = 2, Venus = 3, Earth = 4, Mars = 5, 
                             //Jupiter = 6, Saturn = 7, Uranus = 8, Neptune = 9
var downKeys = new Set();    // Keys currently pressed

var setupEventHandlers = function() {
    let modeSelect = document.getElementById("camera-mode-select"); //Camera mode selection
    let simSelect = document.getElementById("simulation-select"); //Camera mode selection
    let lightSelect = document.getElementById("light-mode-select"); //Light mode selection
    let gridSelect = document.getElementById("grid"); //Check box to show orbits 
    let spinSelect = document.getElementById("spin"); //Check box to show orbits 

    slider.max = maxTime;
    output.innerHTML = slider.value; // Display the default slider value
    
    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function() {
            out = (fileData[Number(this.value)]);
            output.innerHTML = out.toFixed(2);
            time = fileData[Number(this.value)];
            timeHold = Number(this.value);
    };


    // Disable the context menu in the canvas in order to make use of
    // the right mouse button.
    canvas.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });

    //Orbit lines checkbox
    gridSelect.addEventListener("change", 
    function(e) {
        gridShow=!gridShow;
    });

    //Orbit lines checkbox
    spinSelect.addEventListener("change", 
    function(e) {
        spin=!spin;
    });

    //Event listener for camera mode (mouse, fly, or planet)
    simSelect.addEventListener("change", 
        function(e) {
            fileName = e.target.value;
            Shapes.initialized=false;
            timeHold = 0;
            camera.reset();
            moonView = false;
            sunView = false;
            mercuryView = false;
            venusView = false;
            earthView = false;
            marsView = false;
            jupiterView = false;
            saturnView = false;
            uranusView = false;
            neptuneView = false;
            ioView = false;
            europaView = false;
            ganymedeView = false;
            callistoView = false;
            document.getElementById("camera-mode-select").selectedIndex = 0;
            cameraMode = 0;
            fileData = readIn(fileName);
            mercuryLoc.x = fileData[timeHold + 4] * scale;
            mercuryLoc.y = fileData[timeHold + 5] * scale;
            venusLoc.x = fileData[timeHold + 6] * scale;
            venusLoc.y = fileData[timeHold + 7] * scale;
            earthLoc.x = fileData[timeHold + 8] * scale;
            earthLoc.y = fileData[timeHold + 9] * scale;
            marsLoc.x = fileData[timeHold + 10] * scale;
            marsLoc.y = fileData[timeHold + 11] * scale;
            jupiterLoc.x = fileData[timeHold + 12] * scale;
            jupiterLoc.y = fileData[timeHold + 13] * scale;
            saturnLoc.x = fileData[timeHold + 14] * scale;
            saturnLoc.y = fileData[timeHold + 15] * scale;
            uranusLoc.x = fileData[timeHold + 16] * scale;
            uranusLoc.y = fileData[timeHold + 17] * scale;
            neptuneLoc.x = fileData[timeHold + 18] * scale;
            neptuneLoc.y = fileData[timeHold + 19] * scale;

            Shapes.init(gl,fileData,scale);
            tstep = fileData[20] - fileData[0];
            maxTime = fileData.length-20;
        });

    //Event listener for camera mode (mouse, fly, or planet)
    modeSelect.addEventListener("change", 
        function(e) {
            let val = e.target.value;
            if( val === "0" ){
                cameraMode = 0;
                mercuryView = false;
                venusView = false;
                earthView = false;
                marsView = false;
                jupiterView = false;
                saturnView = false;
                uranusView = false;
                neptuneView = false;
                sunView = false;
                ioView = false;
                europaView = false;
                ganymedeView = false;
                callistoView = false;
            }
            else if( val === "1" ){ 
                cameraMode = 1;
                mercuryView = false;
                venusView = false;
                earthView = false;
                marsView = false;
                jupiterView = false;
                saturnView = false;
                uranusView = false;
                neptuneView = false;
                sunView = false;
                moonView = false;
                ioView = false;
                europaView = false;
                ganymedeView = false;
                callistoView = false;
            }
            else if( val === "2" ){
                cameraMode = 2;
                mercuryView = true;
                venusView = false;
                earthView = false;
                marsView = false;
                jupiterView = false;
                saturnView = false;
                uranusView = false;
                neptuneView = false;
                sunView = false;
                moonView = false;
                ioView = false;
                europaView = false;
                ganymedeView = false;
                callistoView = false;
            }   
            else if( val === "3" ){   
                cameraMode = 3;
                venusView = true;
                mercuryView = false;
                earthView = false;
                marsView = false;
                jupiterView = false;
                saturnView = false;
                uranusView = false;
                neptuneView = false;
                sunView = false;
                moonView = false;
                ioView = false;
                europaView = false;
                ganymedeView = false;
                callistoView = false;
            }
            else if( val === "4" ){   
                cameraMode = 4;
                earthView = true;
                mercuryView = false;
                venusView = false;
                marsView = false;
                jupiterView = false;
                saturnView = false;
                uranusView = false;
                neptuneView = false;
                sunView = false;
                moonView = false;
                ioView = false;
                europaView = false;
                ganymedeView = false;
                callistoView = false;
            }
            else if( val === "5" ){   
                cameraMode = 5;
                marsView = true;
                mercuryView = false;
                venusView = false;
                earthView = false;
                jupiterView = false;
                saturnView = false;
                uranusView = false;
                neptuneView = false;
                sunView = false;
                moonView = false;
                ioView = false;
                europaView = false;
                ganymedeView = false;
                callistoView = false;
            }
            else if( val === "6" ){   
                cameraMode = 6;
                jupiterView = true;
                mercuryView = false;
                venusView = false;
                earthView = false;
                marsView = false;
                saturnView = false;
                uranusView = false;
                neptuneView = false;
                sunView = false;
                moonView = false;
                ioView = false;
                europaView = false;
                ganymedeView = false;
                callistoView = false;
            }
            else if( val === "7" ){   
                cameraMode = 7;
                saturnView = true;
                mercuryView = false;
                venusView = false;
                earthView = false;
                marsView = false;
                jupiterView = false;
                uranusView = false;
                neptuneView = false;
                sunView = false;
                moonView = false;
                ioView = false;
                europaView = false;
                ganymedeView = false;
                callistoView = false;
            }
            else if( val === "8" ){   
                cameraMode = 8;
                uranusView = true;
                mercuryView = false;
                venusView = false;
                earthView = false;
                marsView = false;
                jupiterView = false;
                saturnView = false;
                neptuneView = false;
                sunView = false;
                moonView = false;
                ioView = false;
                europaView = false;
                ganymedeView = false;
                callistoView = false;
            }
            else if( val === "9" ){   
                cameraMode = 9;
                neptuneView = true;
                mercuryView = false;
                venusView = false;
                earthView = false;
                marsView = false;
                jupiterView = false;
                saturnView = false;
                uranusView = false;
                sunView = false;
                moonView = false;
                ioView = false; 
                europaView = false;
                ganymedeView = false;
                callistoView = false;         
            }
            else if( val === "10" ){   
                cameraMode = 10;
                sunView = true;
                neptuneView = false;
                mercuryView = false;
                venusView = false;
                earthView = false;
                marsView = false;
                jupiterView = false;
                saturnView = false;
                uranusView = false;
                moonView = false;
                ioView = false;
                europaView = false;
                ganymedeView = false;
                callistoView = false;
            }
            else if( val === "11" ){   
                cameraMode = 11;
                moonView = true;
                sunView = false;
                neptuneView = false;
                mercuryView = false;
                venusView = false;
                earthView = false;
                marsView = false;
                jupiterView = false;
                saturnView = false;
                uranusView = false;
                ioView = false;
                europaView = false;
                ganymedeView = false;
                callistoView = false;
            }
            else if( val === "12" ){   
                cameraMode = 12;
                ioView = true;
                moonView = false;
                sunView = false;
                neptuneView = false;
                mercuryView = false;
                venusView = false;
                earthView = false;
                marsView = false;
                jupiterView = false;
                saturnView = false;
                uranusView = false;
                europaView = false;
                ganymedeView = false;
                callistoView = false;
            }
            else if( val === "13" ){   
                cameraMode = 13;
                ioView = false;
                moonView = false;
                sunView = false;
                neptuneView = false;
                mercuryView = false;
                venusView = false;
                earthView = false;
                marsView = false;
                jupiterView = false;
                saturnView = false;
                uranusView = false;
                europaView = true;
                ganymedeView = false;
                callistoView = false;
            }
            else if( val === "14" ){   
                cameraMode = 14;
                ioView = false;
                moonView = false;
                sunView = false;
                neptuneView = false;
                mercuryView = false;
                venusView = false;
                earthView = false;
                marsView = false;
                jupiterView = false;
                saturnView = false;
                uranusView = false;
                europaView = false;
                ganymedeView = true;
                callistoView = false;
            }
            else if( val === "15" ){   
                cameraMode = 15;
                ioView = false;
                moonView = false;
                sunView = false;
                neptuneView = false;
                mercuryView = false;
                venusView = false;
                earthView = false;
                marsView = false;
                jupiterView = false;
                saturnView = false;
                uranusView = false;
                europaView = false;
                ganymedeView = false;
                callistoView = true;
            }
        }
    );

    canvas.addEventListener("mousemove", 
        function(e) {
            if( mouseState.down ) {
                mouseState.x = e.pageX - this.offsetLeft;
                mouseState.y = e.pageY - this.offsetTop;
                mouseDrag();
                mouseState.prevX = mouseState.x;
                mouseState.prevY = mouseState.y;
            }
        });
    canvas.addEventListener("mousedown", function(e) {
        mouseState.x = e.pageX - this.offsetLeft;
        mouseState.y = e.pageY - this.offsetTop;    
        mouseState.down = true;
        mouseState.prevX = mouseState.x;
        mouseState.prevY = mouseState.y;
        mouseState.button = e.button;
    } );
    canvas.addEventListener("mouseup", function(e) {
        mouseState.x = e.pageX - this.offsetLeft;
        mouseState.y = e.pageY - this.offsetTop;
        mouseState.down = false;
        mouseState.prevX = 0;
        mouseState.prevY = 0;
    } );
    canvas.addEventListener("wheel", function(e) {
        e.preventDefault();
        mouseState.wheelDelta = e.deltaY;
        //Call the dolly function if in mouse mode and using scroll wheel:
        if(cameraMode==0){
        camera.dolly(-mouseState.wheelDelta*0.003); //Multiplied by a very small number to get good speed
        }
        if(cameraMode==2){
            if(mercuryCam.radius>=0.4)
            mercuryCam.radius-=mouseState.wheelDelta*0.001;
            if(mercuryCam.radius<0.4)
            mercuryCam.radius=0.4;
        }
        if(cameraMode==3){
            if(venusCam.radius>=0.7)
            venusCam.radius-=mouseState.wheelDelta*0.001;
            if(venusCam.radius<0.7)
            venusCam.radius=0.7;
        }
        if(cameraMode==4){
            if(earthCam.radius>=0.75)
            earthCam.radius-=mouseState.wheelDelta*0.001;
            if(earthCam.radius<0.75)
            earthCam.radius=0.75;
        }
        if(cameraMode==5){
            if(marsCam.radius>=0.5)
            marsCam.radius-=mouseState.wheelDelta*0.001;
            if(marsCam.radius<0.5)
            marsCam.radius=0.5;
        }
        if(cameraMode==6){
            if(jupiterCam.radius>=7)
            jupiterCam.radius-=mouseState.wheelDelta*0.001;
            if(jupiterCam.radius<7)
            jupiterCam.radius=7;
        }
        if(cameraMode==7){
            if(saturnCam.radius>=5)
            saturnCam.radius-=mouseState.wheelDelta*0.001;
            if(saturnCam.radius<5)
            saturnCam.radius=5;
        }
        if(cameraMode==8){
            if(uranusCam.radius>=3)
            uranusCam.radius-=mouseState.wheelDelta*0.001;
            if(uranusCam.radius<3)
            uranusCam.radius=3;
        }
        if(cameraMode==9){
            if(neptuneCam.radius>=3)
            neptuneCam.radius-=mouseState.wheelDelta*0.001;
            if(neptuneCam.radius<3)
            neptuneCam.radius=3;
        }
        if(cameraMode==10){
            if(sunCam.radius>=4.5)
            sunCam.radius-=mouseState.wheelDelta*0.001;
            if(sunCam.radius<4.5)
            sunCam.radius=4.5;
        }
    } );
    document.addEventListener("keydown", function(e) {
        downKeys.add(e.code);
        e.preventDefault();
    });
    document.addEventListener("keyup", function(e) {
        if(e.code == "Space"){
            camera.reset();
            moonView = false;
            sunView = false;
            mercuryView = false;
            venusView = false;
            earthView = false;
            marsView = false;
            jupiterView = false;
            saturnView = false;
            uranusView = false;
            neptuneView = false;
            ioView = false;
            europaView = false;
            ganymedeView = false;
            callistoView = false;
            document.getElementById("camera-mode-select").selectedIndex = 0;
            cameraMode = 0;
        }
        if(e.code == "KeyP")
            pause = !pause;
        downKeys.delete(e.code);
    });
};

/**
 * Check the list of keys that are currently pressed (downKeys) and
 * update the camera appropriately.  This function is called 
 * from render() every frame.
 */
var updateCamera = function() {

    //If in fly mode, call functions for each key relating to what they should do
    if(cameraMode==1){
        if(downKeys.has("KeyW"))
            camera.dolly((-3)*0.015);
        if(downKeys.has("KeyS"))
            camera.dolly((3)*0.015);
        if(downKeys.has("KeyD"))
            camera.track(3*0.025,0);
        if(downKeys.has("KeyA"))
            camera.track((-3)*0.025,0);
        if(downKeys.has("KeyQ"))
            camera.track(0,2*0.025);
        if(downKeys.has("KeyE"))
            camera.track(0,(-2)*0.025);
            
            //Note: Again, picked very small numbers for good speed
    }

};

/**
 * Called when a mouse motion event occurs and a mouse button is 
 * currently down.
 */
var mouseDrag = function () {
    mouseState.deltaX = mouseState.x - mouseState.prevX; //Calculate how much the mouse moved in the x
    mouseState.deltaY = mouseState.y - mouseState.prevY; //Calculate how much the mouse moved in the y

    //If in mouse mode, call functions for mouse buttons
    if(cameraMode==0){
        if(mouseState.button==2){
            camera.track(-(mouseState.deltaX*0.015), (mouseState.deltaY*0.015));
        }
        if(mouseState.button==0){
            camera.orbit(-mouseState.deltaX*0.015, mouseState.deltaY*0.015);
        }
    }

    //If in fly mode, allow for turning using mouse
    if(cameraMode==1){
        if(mouseState.button==0){
            camera.turn(-mouseState.deltaX*0.01, mouseState.deltaY*0.01);
        }
    }

    if(cameraMode==2){
        if(mouseState.button==0){
            mercuryCam.theta-=mouseState.deltaX*0.005;
            if(mercuryCam.phi<Math.PI && mercuryCam.phi>0)
                mercuryCam.phi+=mouseState.deltaY*0.005;
            if(mercuryCam.phi>=Math.PI)
                mercuryCam.phi=Math.PI-0.001;
            if(mercuryCam.phi<=0)
                mercuryCam.phi=0.001;
        }
    }

    if(cameraMode==3){
        if(mouseState.button==0){
            venusCam.theta-=mouseState.deltaX*0.005;
            if(venusCam.phi<Math.PI && venusCam.phi>0)
                venusCam.phi+=mouseState.deltaY*0.005;
            if(venusCam.phi>=Math.PI)
                venusCam.phi=Math.PI-0.001;
            if(venusCam.phi<=0)
                venusCam.phi=0.001;
        }
    }

    if(cameraMode==4){
        if(mouseState.button==0){
            earthCam.theta-=mouseState.deltaX*0.005;
            if(earthCam.phi<Math.PI && earthCam.phi>0)
                earthCam.phi+=mouseState.deltaY*0.005;
            if(earthCam.phi>=Math.PI)
                earthCam.phi=Math.PI-0.001;
            if(earthCam.phi<=0)
                earthCam.phi=0.001;
        }
    }

    if(cameraMode==5){
        if(mouseState.button==0){
            marsCam.theta-=mouseState.deltaX*0.005;
            if(marsCam.phi<Math.PI && marsCam.phi>0)
                marsCam.phi+=mouseState.deltaY*0.005;
            if(marsCam.phi>=Math.PI)
                marsCam.phi=Math.PI-0.001;
            if(marsCam.phi<=0)
                marsCam.phi=0.001;
        }
    }

    if(cameraMode==6){
        if(mouseState.button==0){
            jupiterCam.theta-=mouseState.deltaX*0.005;
            if(jupiterCam.phi<Math.PI && jupiterCam.phi>0)
                jupiterCam.phi+=mouseState.deltaY*0.005;
            if(jupiterCam.phi>=Math.PI)
                jupiterCam.phi=Math.PI-0.001;
            if(jupiterCam.phi<=0)
                jupiterCam.phi=0.001;
        }
    }

    if(cameraMode==7){
        if(mouseState.button==0){
            saturnCam.theta-=mouseState.deltaX*0.005;
            if(saturnCam.phi<Math.PI && saturnCam.phi>0)
                saturnCam.phi+=mouseState.deltaY*0.005;
            if(saturnCam.phi>=Math.PI)
                saturnCam.phi=Math.PI-0.001;
            if(saturnCam.phi<=0)
                saturnCam.phi=0.001;
        }
    }

    if(cameraMode==8){
        if(mouseState.button==0){
            uranusCam.theta-=mouseState.deltaX*0.005;
            if(uranusCam.phi<Math.PI && uranusCam.phi>0)
                uranusCam.phi+=mouseState.deltaY*0.005;
            if(uranusCam.phi>=Math.PI)
                uranusCam.phi=Math.PI-0.001;
            if(uranusCam.phi<=0)
                uranusCam.phi=0.001;
        }
    }

    if(cameraMode==9){
        if(mouseState.button==0){
            neptuneCam.theta-=mouseState.deltaX*0.005;
            if(neptuneCam.phi<Math.PI && neptuneCam.phi>0)
                neptuneCam.phi+=mouseState.deltaY*0.005;
            if(neptuneCam.phi>=Math.PI)
                neptuneCam.phi=Math.PI-0.001;
            if(neptuneCam.phi<=0)
                neptuneCam.phi=0.001;
        }
    }

    if(cameraMode==10){
        if(mouseState.button==0){
            sunCam.theta-=mouseState.deltaX*0.005;
            if(sunCam.phi<Math.PI && sunCam.phi>0)
                sunCam.phi+=mouseState.deltaY*0.005;
            if(sunCam.phi>=Math.PI)
                sunCam.phi=Math.PI-0.001;
            if(sunCam.phi<=0)
                sunCam.phi=0.001;
        }
    }

    //Note: small numbers used in function calls for good speed
};

// When the HTML document is loaded, call the init function.
window.addEventListener("load", init);
