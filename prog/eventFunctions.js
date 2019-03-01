var movingDistance = 0.1
var upperAngleBound = 18
var map = {};
var oldx = 0
var shot = false
let score
let power = false
/**
 * Responsible for initializing buttons, sliders, radio buttons, etc. present
 * within your HTML document.
 */
function initEventHandelers() {


  document.addEventListener("keydown", function(event) {
    if(event.keyCode == 32) {
      scene.camera.checkIfInLineOfSight(1,-8.8)
    }
    if(event.key != "w" && event.key != "s" && event.key != "d" && event.key != "a" && event.key != "j" && event.key != "k") return
    map[event.key] = true;
    //We use map to allow combinations of presses
    if(map.w) {
      scene.camera.forward(movingDistance)
      document.getElementById("gun").classList.add("move")
    } else if(map.s) {
      scene.camera.backward(movingDistance)
      document.getElementById("gun").classList.add("move")
    }
    if(map.d) {
      scene.camera.right(movingDistance)
      document.getElementById("gun").classList.add("move")
    } else if(map.a) {
      scene.camera.left(movingDistance)
      document.getElementById("gun").classList.add("move")
    }

    //Rotating
    if(map.k) {
      scene.camera.rotate(-upperAngleBound/3)
    } else if(map.j) {
      scene.camera.rotate(upperAngleBound/3)
    }
    scene.camera.updateCamera()

  })

  document.addEventListener("keyup", function(event) {
    map[event.key] = false //We clear the key from the map
    document.getElementById("gun").classList.remove("move")
  })



  canvas.onmousedown = function(ev) { // Mouse is pressed
    if(shot) return

    var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      // Check if it is on object
      var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
      var result = check(x_in_canvas, y_in_canvas);
      setTimeout(() => {
        if (result.picked) alert(result.msg);
        if (parseInt(score) == 2) {
          window.location.href = "https://giphy.com/embed/6fScAIQR0P0xW"
        }
      },300)

   }
   setTimeout(() => {
     shot = false
     document.getElementById('laser').currentTime = 0
   },1000)

 }

  canvas.addEventListener("mousemove", function(event) {
    let left = (oldx-event.pageX)/3
    let right = (event.pageX - oldx)/3
    left > upperAngleBound? left = upperAngleBound : left = left
    right > upperAngleBound? right = -upperAngleBound : right = -right
    if (event.pageX < oldx) {
        scene.camera.rotate(left)
    } else if (event.pageX > oldx) {
        scene.camera.rotate(right)
    }
    scene.camera.updateCamera()
    oldx = event.pageX;
  })

}

function check(x, y) {
  score = parseInt(document.getElementById("killed").textContent)
  var picked = false;
  sendUniformIntToGLSL(1, "u_Clicked")
  scene.render()
  var pixels = new Uint8Array(4);
  let msg = ""
  gl.readPixels(x,y,1,1, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  if(pixels[0] != 0 || pixels[1] != 0 || pixels[2] != 0) {
    picked = true
    if(pixels[0]) {
      shoot()
      msg = "Darth Mizi: So be it Jedi!"
      document.getElementById('a1').volume = 1
      document.getElementById("a1").play()
      score++
      document.getElementById("killed").textContent = score
      scene.geometries.splice(-3,1)
    }
    if(pixels[1]) {
      shoot()
      if(!power) {
        msg = "Darth Meow: You are still no match for the power of the dark side!"
        document.getElementById('a2').volume = 1
        document.getElementById("a2").play()
      } else {
        msg = "Darth Meow: The force is strong with you!"
        document.getElementById('a4').volume = 1
        document.getElementById("a4").play()
        score++
        document.getElementById("killed").textContent = score
        scene.geometries.splice(-2,1)
      }

    }
    if(pixels[2]) {
      msg = "Master Slug: 'Strong am I with the force!'"
      document.getElementById('a3').volume = 1
      document.getElementById("a3").play()
      scene.geometries[scene.geometries.length-1].modelMatrix.scale(2,2,2)
      power = true
      setTimeout(() => {
        document.getElementById('power').volume = 1
        document.getElementById("power").play()
        document.getElementById("powerup").style.display = "block"
        setTimeout(() => {
          document.getElementById("powerup").style.display = "none"
        }, 4000)
      },500)

    }
  }
  sendUniformIntToGLSL(0, "u_Clicked")
  scene.render()

  return {picked: picked, msg: msg};
}

function shoot() {
  shot = true
  document.getElementById('laser').volume = 1
  document.getElementById("laser").play()
  document.getElementById("fire").style.display = "block"
  setTimeout(() => {
    document.getElementById("fire").style.display = "none"
  },100)
}
