/**
 * Sends a WebGL 2D texture object (created by load2DTexture) and sends it to
 * the shaders.
 *
 * @param val The WebGL 2D texture object being passed
 * @param {Number} textureUnit The texture unit (0 - 7) where the texture will reside
 * @param {String} uniformName The name of the uniform variable where the texture's
 * textureUnit location (0 - 7) will reside
 */
function send2DTextureToGLSL(val, textureUnit, uniformName) {
  //    1. Gather your uniform location
  var uniformVar = gl.getUniformLocation(gl.program, uniformName);
  //    2. Determine the texture unit you will be using (gl.TEXTURE"N")
  let unit
  switch (textureUnit) {
    case 0:
      unit = gl.TEXTURE0
      break;
    case 1:
      unit = gl.TEXTURE1
      break;
    case 2:
      unit = gl.TEXTURE2
      break;
    case 3:
      unit = gl.TEXTURE3
      break;
    case 4:
      unit = gl.TEXTURE4
      break;
    case 5:
      unit = gl.TEXTURE5
      break;
    case 6:
      unit = gl.TEXTURE6
      break;
    case 7:
      unit = gl.TEXTURE7
      break;
    default:
      return
  }
  //    3. Activate your texture unit using gl.activeTexture
  gl.activeTexture(unit);
  //    4. Bind your texture using gl.bindTexture
  gl.bindTexture(gl.TEXTURE_2D, val);
  //    5. Send the texture unit (textureUnit not the one you found) to your
  //       uniform location.
  gl.uniform1i(uniformVar, textureUnit);

}

/**
 * Creates a WebGl 2D texture object.
 *
 * @param imgPath A file path/data url containing the location of the texture image
 * @param magParam texParameteri for gl.TEXTURE_MAG_FILTER. Can be gl.NEAREST,
 * gl.LINEAR, etc.
 * @param minParam texParameteri for gl.TEXTURE_MIN_FILTER. Can be gl.NEAREST,
 * gl.LINEAR, etc.
 * @param wrapSParam texParameteri for gl.TEXTURE_WRAP_S. Can be gl.REPEAT,
 * gl. MIRRORED_REPEAT, or gl.CLAMP_TO_EDGE.
 * @param wrapTParam texParameteri for gl.TEXTURE_WRAP_S. Can be gl.REPEAT,
 * gl. MIRRORED_REPEAT, or gl.CLAMP_TO_EDGE.
 * @param callback A callback function which executes with the completed texture
 * object passed as a parameter.
 */
function create2DTexture(imgPath, magParam, minParam, wrapSParam, wrapTParam, callback) {
  let image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = function() {
      //  1. create a texture object by saving the result of gl.createTexture()
      var texture = gl.createTexture();
      //  2. Flip your image's y-axis and bind your texture object to gl.TEXTURE_2D
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
      gl.bindTexture(gl.TEXTURE_2D, texture);
      //  3. Using multiple calls to gl.texParameteri, pass magParam, minParam,
      //     wrapSParam, and wrapTParam.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magParam);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minParam);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapSParam);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapTParam);
      //  4. Set the texture's image to the loaded image using gl.texImage2D
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      //  5. Pass your completed texture object to your callback function
      resolve(texture)
    }
    image.onerror = reject
    image.src = imgPath
  })

}
/**
 * Sends data to a uniform variable expecting a matrix value.
 *
 * @private
 * @param {Array} val Value being sent to uniform variable
 * @param {String} uniformName Name of the uniform variable recieving data
 */
 function sendUniformMatToGLSL(val, uniformName) {
   let u_var = gl.getUniformLocation(gl.program, uniformName);
   if (!u_var) {
     console.log('Failed to get '+uniformName+' variable');
     return;
   }
   //We have to handle each case now differently
   switch (val.length) {
     case 16:
       gl.uniformMatrix4fv(u_var, false, val);
       break;
     case 9:
       gl.uniformMatrix3fv(u_var, false, val);
       break;
     case 4:
       gl.uniformMatrix2fv(u_var, false, val);
       break;
     default:
       console.log('Wrong array size')
       return
   }
   // Recomendations: This is going to be very similar to sending a float/vec.
}

/**
 * Sends data to an attribute variable using a buffer.
 *
 * @private
 * @param {Float32Array} data Data being sent to attribute variable
 * @param {Number} dataCount The amount of data to pass per vertex
 * @param {String} attribName The name of the attribute variable
 * @param {Number} stride The amount of data to pass per vertex
 * @param {Number} offset The amount of data to pass per vertex
 */
function sendAttributeBufferToGLSL(data, dataCount, attribName, stride = 0, offset = 0) {
  // Create a buffer object
  let buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object ')
    return
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // Write date into the buffer
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  let attribute = gl.getAttribLocation(gl.program, attribName);
  if (attribute < 0) {
    console.log('Failed to get the storage location of '+attribName)
    return
  }

  let FSIZE = data.BYTES_PER_ELEMENT;
  // Assign the buffer object to attribute variable
  gl.vertexAttribPointer(attribute, dataCount, gl.FLOAT, false, FSIZE*stride, FSIZE*offset);
  gl.enableVertexAttribArray(attribute);
}

function sendIndicesBufferToGLSL(indices) {
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}

/**
 * Draws the current buffer loaded. Buffer was loaded by sendAttributeBufferToGLSL.
 *
 * @param {Integer} pointCount The amount of vertices being drawn from the buffer.
 * @param {Integer} pointCount Mode to draw. --> this is insane not to use fan for circles or later elements for cubes

 */
function tellGLSLToDrawCurrentBuffer(pointCount, mode) {
  //we use here triangle_fan to make circles the easy way!
  switch (mode) {
    case ModesEnum.fan:
      gl.drawArrays(gl.TRIANGLE_FAN, 0, pointCount)
      break;
    case ModesEnum.elements:
      gl.drawElements(gl.TRIANGLES, pointCount, gl.UNSIGNED_SHORT, 0);
      break;
    default:
      gl.drawArrays(gl.TRIANGLES, 0, pointCount)
  }
}

/**
 * Sends a float value to the specified uniform variable within GLSL shaders.
 * Prints an error message if unsuccessful.
 *
 * @param {float} val The float value being passed to uniform variable
 * @param {String} uniformName The name of the uniform variable
 */
function sendUniformFloatToGLSL(val, uniformName) {
  let u_var = gl.getUniformLocation(gl.program, uniformName);
  if (!u_var) {
    console.log('Failed to get '+uniformName+' variable');
    return;
  }
  //Just one float, easy
  gl.uniform1f(u_var, val);
}

function sendUniformIntToGLSL(val, uniformName) {
  let u_var = gl.getUniformLocation(gl.program, uniformName);
  if (!u_var) {
    console.log('Failed to get '+uniformName+' variable');
    return;
  }
  //Just one float, easy
  gl.uniform1i(u_var, val);
}

/**
 * Sends an JavaSript array (vector) to the specified uniform variable within
 * GLSL shaders. Array can be of length 2-4.
 *
 * @param {Array} val Array (vector) being passed to uniform variable
 * @param {String} uniformName The name of the uniform variable
 */
function sendUniformVec4ToGLSL(val, uniformName) {
  // Get the storage location of uniform variable
  let u_var = gl.getUniformLocation(gl.program, uniformName);
  if (!u_var) {
    console.log('Failed to get '+uniformName+' variable');
    return;
  }
  //We have to handle each case now differently
  switch (val.length) {
    case 2:
      gl.uniform2fv(u_var, val);
      break;
    case 3:
      gl.uniform3fv(u_var, val);
      break;
    case 4:
      gl.uniform4fv(u_var, val);
      break;
    default:
      console.log('Wrong array size')
      return
  }
}
