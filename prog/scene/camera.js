class Camera {
  constructor(orthogonal = false) {
    //Initial vectors
    this.eye = new Vector3([0,0,0]);
    this.at = new Vector3([0,0,-1])
    this.up = new Vector3([0,1,0]);
    this.side = new Vector3([1,0,0]) //Needed to change the directions after rotation
    this.orthogonal = orthogonal
    //Setting intial position of the user
    this.forward(10)
    this.rotate(180)
    this.left(1)
    //Updating everything
    this.updateCamera()
    this.updateProjection()
  }

  forward(dist) {
    this.eye.elements[0] += this.at.elements[0]*dist;
    this.eye.elements[1] += this.at.elements[1]*dist;
    this.eye.elements[2] += this.at.elements[2]*dist;
  }
  backward(dist) {
    this.eye.elements[0] -= this.at.elements[0]*dist;
    this.eye.elements[1] -= this.at.elements[1]*dist;
    this.eye.elements[2] -= this.at.elements[2]*dist;
  }
  right(dist) {
    this.eye.elements[0] += this.side.elements[0]*dist;
    this.eye.elements[1] += this.side.elements[1]*dist;
    this.eye.elements[2] += this.side.elements[2]*dist;
  }
  left(dist) {
    this.eye.elements[0] -= this.side.elements[0]*dist;
    this.eye.elements[1] -= this.side.elements[1]*dist;
    this.eye.elements[2] -= this.side.elements[2]*dist;
  }
  rotate(angle) {
    let rotate = new Matrix4().setRotate(angle, 0, 1, 0)
    this.at = rotate.multiplyVector3(this.at)
    this.side = this.crossVec3(this.at, this.up)
    this.side = this.normalizeVec3(this.side)
  }

  checkIfInLineOfSight(x,z) {
    //console.log(x,z)


    if (x < 0) x *= -1
    if (z < 0) z *= -1
    let v = this.side.elements
    let cX = this.roundUp(v[0], 1)
    let cZ = this.roundUp(v[2], 1)
    let e = this.eye.elements
    let eX = this.roundUp(e[2], 1)
    if(eX < 0) eX *= -1
    if(eX < z+0.6) {
      return
    }
    console.log(eX, z+0.6)

    //if(cX < 0) cX *= -1
    //if(cZ < 0) cZ *= -1
    let pos = this.roundUp((x+z)/(x+z)*(x+z)/10,1)
    console.log(pos)
    console.log((cX+cZ)/(cX+cZ)*(cX+cZ))
/*    if(cX <= 1.1 && cX >= 0.9 && cZ <= 0.2) {
      console.log("HIT") //front and back
    }
    if(cZ <= 1.1 && cZ >= 0.9 && cX <= 0.2) {
      console.log("HIT") //from the left
    }
    if(cZ == cX) {
      console.log("HIT") //with angle
    } */
  }

  updateCamera() {
    let v3 = this.addVec3(this.eye, this.at) //In order to change directons
    scene.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], v3.elements[0], v3.elements[1], v3.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]);
  }

  updateProjection() {
    if(this.orthogonal) {
      scene.projMatrix.setOrtho(-10.0, 10.0, -10.0, 10.0, near, far);
    } else {
      scene.projMatrix.setPerspective(fov, gl.canvas.width/gl.canvas.height, near, far);
    }
    //We update the shader
    sendUniformMatToGLSL(scene.projMatrix.elements, "u_ProjMatrix")
  }


//Basic operations needed for the camera
  addVec3(v1, v2) {
    let v3 = new Vector3([v1.elements[0] + v2.elements[0], v1.elements[1] + v2.elements[1], v1.elements[2] + v2.elements[2]])
    return v3
  }

  crossVec3(v1, v2) {
    let v3 = new Vector3()
    v3.elements[0] = v1.elements[1] * v2.elements[2] - v1.elements[2] * v2.elements[1];
    v3.elements[1] = v1.elements[2] * v2.elements[0] - v1.elements[0] * v2.elements[2];
    v3.elements[2] = v1.elements[0] * v2.elements[1] - v1.elements[1] * v2.elements[0];
    return v3
  }

  normalizeVec3(v1) {
    let rls = 1 / Math.sqrt(v1.elements[0]*v1.elements[0] + v1.elements[1]*v1.elements[1] + v1.elements[2]*v1.elements[2]);
    v1.elements[0] *= rls;
    v1.elements[1] *= rls;
    v1.elements[2] *= rls;
    return v1
  }

   roundUp(num, precision) {
    precision = Math.pow(10, precision)
    return Math.ceil(num * precision) / precision
  }


}
