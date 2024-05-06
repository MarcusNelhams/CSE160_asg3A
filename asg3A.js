// HelloPoint1.js (c) 2012 matsuda

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_WhichTexture;
  void main() {
    vec4 bodyTexture = texture2D(u_Sampler0, v_UV);
    vec4 eyeTexture = texture2D(u_Sampler1, v_UV);
    vec4 grassTexture = texture2D(u_Sampler2, v_UV);
    if (u_WhichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_WhichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_WhichTexture == 0) {
      gl_FragColor = 0.5 * bodyTexture + 0.5 * u_FragColor;
      // gl_FragColor = 0.5 * bodyTexture + 0.5 * bodyTexture;
    } else if (u_WhichTexture == 1) {
      gl_FragColor = eyeTexture;
    } else if (u_WhichTexture == 2) {
      gl_FragColor = grassTexture;
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }
  }`

// Global Vars
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_WhichTexture;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;


// Sets up WebGL
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer:true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

// Connects js vars to GLSL vars in shaders
function connectVarsToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  // Get the storage location of u_sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  // Get the storage location of u_WhichTexture
  u_WhichTexture = gl.getUniformLocation(gl.program, 'u_WhichTexture');
  if (!u_WhichTexture) {
    console.log('Failed to get the storage location of u_WhichTexture');
    return false;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  return;
}

function initTextures() {
  // create image object
  var image = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }

  var image3 = new Image();
  if(!image3) {
    console.log('Failed to create the image object');
    return false;
  }

  // register the event handler to be called on loading an image
  image.onload = function() { sendImageToTEXTURE0(image);};
  // tell the browser to load an image
  image.src = 'cow2.jpg';

  image2.onload = function() { sendImageToTEXTURE1(image2);};
  image2.src = 'eye.jpg';

  image3.onload = function() { sendImageToTEXTURE2(image3); };
  image3.src = 'grass.jpg';
  return true;
}

function sendImageToTEXTURE0(image) {
  // create texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create a texture object');
    return false;
  }

  // flip image y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // bind the texture obj to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // set the texture params
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler0, 0);

  // console.log('finished loadTexture');
}

function sendImageToTEXTURE1(image) {
  // create texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create a texture object');
    return false;
  }

  // flip image y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable texture unit1
  gl.activeTexture(gl.TEXTURE1);
  // bind the texture obj to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // set the texture params
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler1, 1);

  //console.log('finished loadTexture');
}

function sendImageToTEXTURE2(image) {
  // create texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create a texture object');
    return false;
  }

  // flip image y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable texture unit1
  gl.activeTexture(gl.TEXTURE2);
  // bind the texture obj to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // set the texture params
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler2, 2);

  console.log('finished loadTexture');
}

// Extract mouse coords and return WebGL coords
function convertCoordinatesEventToGL(ev) {

  if (keysDown[16]) return [g_globalXAngle/90, g_globalYAngle/90];

  var x = ev.clientX; // Get mouse x position
  var y = ev.clientY; // Get mouse y position
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2) / (canvas.width / 2);
  y = (canvas.height/2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

// global UI elements
let g_globalYAngle = 0;
let g_globalXAngle = -20;
let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0-g_startTime;
let g_animation = false;
let g_poke = false;
let g_pokeStart = 0;

// global animation angles
let g_frontLegAngle = 0;
let g_backLegAngle = 0;
let g_frontKneeAngle = 0;
let g_backKneeAngle = 0;
let g_frontHoofAngle = 0;
let g_bodyAngle = 0;
let g_tailAngle = 70;
let g_bodyY = 0;


function addActionsForHtmlUI() {
  
  // camera slider
  document.getElementById('globSlide').addEventListener('mousemove', function() { g_globalXAngle = this.value });


  // Front Leg Sliders
  document.getElementById('UFRLegSlide').addEventListener('mousemove', function() { if (!g_animation) g_frontLegAngle = this.value; renderAllShapes(); });
  document.getElementById('FRKSlide').addEventListener('mousemove', function() { g_frontKneeAngle = this.value; renderAllShapes(); });
  document.getElementById('FHSlide').addEventListener('mousemove', function() { g_frontHoofAngle = this.value; renderAllShapes(); });

  // Animation Buttons
  document.getElementById('FLAnimationOnButton').onclick = function() {g_animation = true;}
  document.getElementById('FLAnimationOffButton').onclick = function() {g_animation = false; g_poke = false;}

}

function sendTextToHTML(text) {
  const output = document.getElementById('output');
  output.textContent = text;
}

function UpdateAnimationAngles() {
  if (g_poke) {
    let speed = 2;
    if (g_seconds - g_pokeStart < 3/speed) {

      g_bodyAngle = 117*((g_seconds - g_pokeStart)*1.037*speed);
      g_bodyY = 2*Math.sin((g_seconds -g_pokeStart)*1.047*speed)

      g_frontLegAngle = 40*Math.sin((g_seconds - g_pokeStart)*1.05*speed);
      g_backLegAngle = -40*Math.sin((g_seconds - g_pokeStart)*1.05*speed);

      g_tailAngle = -90*Math.sin((g_seconds - g_pokeStart) * 1.05 * speed) + 70;

    } else {
      g_bodyAngle = 0;
      g_bodyY = 0;
      g_tailAngle = 70;
      g_poke = false;
    }
    return;
  }

  speed = 5;
  dAng_dTime = g_frontLegAngle;
  if (g_animation) {
    g_bodyAngle = 7*Math.sin(g_seconds * speed);
    g_tailAngle = -1.5*g_bodyAngle + 70;
    g_frontLegAngle = 30*Math.sin(g_seconds * speed);
    g_backLegAngle = -g_frontLegAngle - 10;
    dAng_dTime = dAng_dTime - g_frontLegAngle;

    if (dAng_dTime >= 0) {
      if (g_frontLegAngle > 1) {
        g_frontKneeAngle = -2*g_frontLegAngle;
      } else if (g_frontLegAngle < 1 && g_frontLegAngle > -1) {
        g_frontKneeAngle = 0;
      } else {
        g_frontKneeAngle = 2*g_frontLegAngle;
      }
    } else {
      g_frontKneeAngle = -60;
    }

    if (dAng_dTime <= 0) {
      if (g_frontLegAngle > 1) {
        g_backKneeAngle = -2*g_frontLegAngle;
      } else if (g_frontLegAngle < 1 && g_frontLegAngle > -1) {
        g_backKneeAngle = 0;
      } else {
        g_backKneeAngle = 2*g_frontLegAngle;
      }
    } else {
      g_backKneeAngle = -60;
    }

  }
}

// Render all shapes defined by buffers onto canvas
function renderAllShapes() {
  // check time for performance check
  var start = performance.now()

  // pass projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(45, canvas.width/canvas.height, .1, 100)
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // pass view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(0,0,-5, 0,0,0, 0,1,0); // (camera_loc, looking_at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(-g_globalXAngle,0,1,0);
  globalRotMat.rotate(g_globalYAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear Canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // colors
  let brown = [.44,.15,.01,1]
  let dBrown = [brown[0]*.9, brown[1]*.9, brown[2]*.9, 1];
  let hBrown = [brown[0]*.4, brown[1]*.4, brown[2]*.4, 1];
  let groundColor = [.3, .7, .3, 1];
  let skyColor = [.53, .81, 1, 1];

  // sky
  var skyM = new Matrix4();
  skyM.scale(50, 50, 50);
  skyM.translate(-.5, -.5, -.5);
  var sky = new Cube(skyM, skyColor);
  sky.render();

  // ground
  var groundM = new Matrix4();
  groundM.translate(-25, -.65, -25);
  groundM.scale(50, .001, 50);
  var ground = new Cube(groundM, groundColor, 2);
  ground.render();

  // body
  var bodyM = new Matrix4();
  bodyM.translate(-.3, g_bodyY-.009, 0);
  bodyM.rotate(g_bodyAngle, 1, 0, 0);
  bodyM.translate(0, -.3, -.5)
  var bodyPosM = new Matrix4(bodyM);  // save body pos
  bodyM.translate(0, .2, .5)
  bodyM.scale(0.6, 0.6, 1.1);
  bodyM.translate(0,-.3, -.5)
  var body = new Cube(bodyM, dBrown, 0);
  body.render();

  // front left leg
  var leftArmM = new Matrix4(bodyPosM);
  leftArmM.translate(.3,0,0)
  leftArmM.translate(0.07, .3, 0.25);
  leftArmM.rotate(g_frontLegAngle, 1, 0, 0);
  leftArmM.translate(0, -.5, -.125);
  var leftArmPos = new Matrix4(leftArmM);
  leftArmM.scale(0.15, 0.25, 0.15);
  var leftArm = new Cube(leftArmM, brown, 0);
  leftArm.render();

  leftArmM = leftArmPos;
  leftArmM.translate(.01, -.1, .01);
  leftArmM.scale(.13, .15, .13);
  leftArmM.translate(0, 1, .5)
  leftArmM.rotate(g_frontKneeAngle, 1, 0, 0);
  leftArmM.translate(0, -1, -.5)
  var leftArm = new Cube(leftArmM, brown, 0);
  leftArm.render();

  leftArmM.scale(.9, .9, .8);
  leftArmM.translate(.1, -.3, .1);
  leftArmM.translate(0, .5, .5);
  leftArmM.rotate(g_frontHoofAngle, 1, 0, 0);
  leftArmM.translate(0, -.5, -.5);
  hoof = new Cube(leftArmM, hBrown);
  hoof.render();

  // front right leg
  var rightArmM = new Matrix4(bodyPosM);
  rightArmM.translate(0.07, .3, 0.25);
  rightArmM.rotate(g_frontLegAngle, 1, 0, 0);
  rightArmM.translate(0.00, -.5, -.125);
  var rightArmPos = new Matrix4(rightArmM);
  rightArmM.scale(0.15, 0.25, 0.15);
  var rightArm = new Cube(rightArmM, brown, 0);
  rightArm.render();

  rightArmM = rightArmPos;
  rightArmM.translate(.01, -.1, .01);
  rightArmM.scale(.13, .15, .13);
  rightArmM.translate(0, 1, .5)
  rightArmM.rotate(g_frontKneeAngle, 1, 0, 0);
  rightArmM.translate(0, -1, -.5)
  rightArm = new Cube(rightArmM, brown, 0);
  rightArm.render();

  rightArmM.scale(.9, .9, .8);
  rightArmM.translate(.1, -.3, .1);
  rightArmM.translate(0, .5, .5);
  rightArmM.rotate(g_frontHoofAngle, 1, 0, 0);
  rightArmM.translate(0, -.5, -.5);
  hoof = new Cube(rightArmM, hBrown);
  hoof.render();

  // back right leg
  var rightLegM = new Matrix4(bodyPosM);
  rightLegM.translate(0, 0, .65)
  rightLegM.translate(0.07, .3, 0.25);
  rightLegM.rotate(g_backLegAngle, 1, 0, 0);
  rightLegM.translate(0.00, -.5, -.125);
  var rightLegPos = new Matrix4(rightLegM);
  rightLegM.scale(0.15, 0.25, 0.15);
  var rightLeg = new Cube(rightLegM, brown, 0);
  rightLeg.render();

  rightLegM = rightLegPos;
  rightLegM.translate(.01, -.1, .01);
  rightLegM.scale(.13, .15, .13);
  rightLegM.translate(0, 1, .5)
  rightLegM.rotate(g_backKneeAngle, 1, 0, 0);
  rightLegM.translate(0, -1, -.5)
  rightLeg = new Cube(rightLegM, brown, 0);
  rightLeg.render();

  rightLegM.scale(.9, .9, .8);
  rightLegM.translate(.1, -.3, .1);
  hoof = new Cube(rightLegM, hBrown);
  hoof.render();

  // back left leg
  var backLegM = new Matrix4(bodyPosM);
  backLegM.translate(.3, 0, .65)
  backLegM.translate(0.07, .3, 0.25);
  backLegM.rotate(g_backLegAngle, 1, 0, 0);
  backLegM.translate(0.00, -.5, -.125);
  var backLegPos = new Matrix4(backLegM);
  backLegM.scale(0.15, 0.25, 0.15);
  var backLeg = new Cube(backLegM, brown, 0);
  backLeg.render();

  backLegM = backLegPos;
  backLegM.translate(.01, -.1, .01);
  backLegM.scale(.13, .15, .13);
  backLegM.translate(0, 1, .5)
  backLegM.rotate(g_backKneeAngle, 1, 0, 0);
  backLegM.translate(0, -1, -.5)
  backLeg = new Cube(backLegM, brown, 0);
  backLeg.render();

  backLegM.scale(.9, .9, .8);
  backLegM.translate(.1, -.3, .1);
  hoof = new Cube(backLegM, hBrown);
  hoof.render();

  // Head
  var headM = new Matrix4(bodyPosM);
  headM.translate(0.1, .5, -.3);
  headM.rotate(0, 0, 0, 1);
  headM.scale(0.4, 0.4, 0.4);
  var headPos = new Matrix4(headM);
  var head = new Cube(headM, brown, 0);
  head.render();

  // face
  var eyesM = new Matrix4(headPos);
  eyesM.translate(.25, .7, -.0001);
  eyesM.scale(.1, .1, .1);
  var lEye = new Cube(eyesM, [0, .5, .25, 1], 1);
  lEye.render();

  eyesM.translate(4,0,0);
  var rEye = new Cube(eyesM, [0, .5, .25, 1], 1);
  rEye.render();

  var noseM = new Matrix4(headPos);
  noseM.translate(0.1, .05, -.35);
  noseM.scale(.8, .5, .5);
  var nose = new Cube(noseM, dBrown, 0);
  nose.render();

  noseM.translate(.2, .2, -.001);
  noseM.scale(.2,.35,.1);
  var lNos = new Cube(noseM, [0,0,0,1]);
  lNos.render();

  noseM.translate(2, 0, 0);
  var rNos = new Cube(noseM, [0,0,0,1]);
  rNos.render();

  var earM = new Matrix4(headPos);
  earM.translate(-.2, .5, .6);
  earM.scale(.2, .3, .1);
  var lEar = new Cube(earM, dBrown, 0);
  lEar.render();

  earM.translate(6,0,0);
  var rEar = new Cube(earM, dBrown, 0);
  rEar.render();

  // right horn
  var hornM = new Matrix4(headPos);
  hornM.translate(1,.8,.3);
  hornM.rotate(-90, 0, 0, 1);
  hornM.scale(.07, .6, .07);
  var rHorn1 = new Cone(hornM, 10, [1,1,1,1]);
  rHorn1.render();

  hornM.translate(0, 1, 0);
  hornM.rotate(180, 0, 0, 1);
  var rHorn2 = new Cone(hornM, 10, [1,1,1,1]);
  rHorn2.render();

  hornM = new Matrix4(headPos);
  hornM.translate(1.55, .78, .3);
  hornM.rotate(-45, 0, 0, 1);
  hornM.scale(.07, .6, .07)
  rHorn3 = new Cone(hornM, 10, [1,1,1,1]);
  rHorn3.render();

  // left horn
  var hornM = new Matrix4(headPos);
  hornM.translate(-1.5, 0, 0);
  hornM.translate(1,.8,.3);
  hornM.rotate(-90, 0, 0, 1);
  hornM.scale(.07, .6, .07);
  var rHorn1 = new Cone(hornM, 10, [1,1,1,1]);
  rHorn1.render();

  hornM.translate(0, 1, 0);
  hornM.rotate(180, 0, 0, 1);
  var rHorn2 = new Cone(hornM, 10, [1,1,1,1]);
  rHorn2.render();

  hornM = new Matrix4(headPos);
  hornM.translate(-.45, .78, .3);
  hornM.rotate(45, 0, 0, 1);
  hornM.scale(.07, .6, .07)
  rHorn3 = new Cone(hornM, 10, [1,1,1,1]);
  rHorn3.render();

  // tail
  var tailM = new Matrix4(bodyPosM);
  tailM.translate(0.27, .5, 1.0);
  tailM.rotate(g_tailAngle, 1, 0, 0);
  tailM.scale(0.05, 0.05, .6);
  var tail = new Cube(tailM, brown, 0);
  tail.render();

  // performance check
  var duration = performance.now() - start;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration));
}

// registers mouse click and pushes inputed values to buffers
function handleOnClick(ev) {
  if (ev.buttons != 1) {
    return;
  }

  if (keysDown[16]) {
    g_pokeStart = g_seconds;
    g_bodyAngle = 0;
    g_backLegAngle = 0;
    g_frontLegAngle = 0;
    g_backKneeAngle = 0;
    g_frontKneeAngle = 0;
    g_tailAngle = 70;
    g_poke = true;
    g_animation = false;
  } 
  
  let [x, y] = convertCoordinatesEventToGL(ev);

  g_globalXAngle = x*90;
  g_globalYAngle = y*90;

  renderAllShapes();
}

// keep track of currently down  keys
let keysDown = {}

// handles when a keyboard key is pressed
function handleOnKeyDown(ev) {
  // store keys pressed
  keysDown[ev.keyCode] = true;
}

// handles if a keyboard key is unpressed
function handleOnKeyUp(ev) {
  keysDown[ev.keyCode] = false;
}

function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;

  UpdateAnimationAngles();

  renderAllShapes();

  requestAnimationFrame(tick);
}

function main() {

  setupWebGL();
  connectVarsToGLSL();
  addActionsForHtmlUI();
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  canvas.onmousedown = handleOnClick;
  canvas.onmousemove = handleOnClick;
  document.addEventListener('keydown', handleOnKeyDown);
  document.addEventListener('keyup', handleOnKeyUp);

  requestAnimationFrame(tick);
}