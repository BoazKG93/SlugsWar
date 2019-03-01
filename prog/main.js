//This is some bad coding, but for such a small task.. whatever
var canvas,gl,fov = 90, near = 0.1, far = 12


var ModesEnum = Object.freeze({
  "fan":1,
  "elements": 2
})

var MatrixEnum = Object.freeze({
  "projection":1,
  "orthogonal": 2
})


/**
 * Function called when the webpage loads.
 */
function main() {
  document.getElementById("loading").style.display = "none"
  document.getElementById("a0").volume = 0.2
  document.getElementById("a0").play()
  canvas = document.getElementById('canvas')
  if (!canvas) {
    console.log("lol you don't have canvas")
    return
  }
  canvas.style.cursor = "pointer";
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight
  gl = getWebGLContext(canvas)

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL')
    return
  }

  //create the scene and render it empty
  scene = new Scene()
  scene.camera = new Camera(false) //false for orth
  initEventHandelers()
  tick()
}

function resize() {
  gl.canvas.width  = window.innerWidth;
  gl.canvas.height = window.innerHeight;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  scene.camera.updateProjection()
}

function sampleImageColor(image) {
  var canvas_s = document.createElement('canvas');
  canvas_s.height = image.height;
  canvas_s.width = image.width;
  var context = canvas_s.getContext('2d');
  context.drawImage(image, 0, 0);

  var colorData = context.getImageData(0, 0, image.width, image.height).data;

  return colorData;
}
