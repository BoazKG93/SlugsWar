/**
 * Specifies a geometric object.
 *
 * @author "Your Name Here"
 * @this {Geometry}
 */
class Geometry {
  /**
   * Constructor for Geometry.
   *
   * @constructor
   */
  constructor() {
    this.spin = 0;
    this.vertices = []; // Vertex objects. Each vertex has x-y-z.
    this.color = [0,0,0,1];  // Default
    this.modelMatrix = new Matrix4(); // Model matrix applied to geometric object
    this.shader = null; // shading program you will be using to shade this geometry
    this.texture = null

    //We create data
    this.data = []
    this.uv_data = []
    this.color_data = []
    this.normal_data = []
  }


  flatData() {
    //We push all points array to data
    for (var i = 0; i < this.vertices.length; i++) {
      //This is required for loaded objects. We take the elements of the Vector4
      //Notice we use slice.call to reduce the array back to normal array instead of Float32
      this.data.push(Array.prototype.slice.call(this.vertices[i].points.elements))
      this.uv_data.push(Array.prototype.slice.call(this.vertices[i].uv))
      this.color_data.push(Array.prototype.slice.call(this.vertices[i].color))
      this.normal_data.push(Array.prototype.slice.call(this.vertices[i].normal.elements))
    }
    //We flatten data so we can use it as a 1d array
    this.data = new Float32Array(this.data.flat())
    this.uv_data = new Float32Array(this.uv_data.flat())
    this.color_data = new Float32Array(this.color_data.flat())
    this.normal_data = new Float32Array(this.normal_data.flat())
  }

  render() {
    sendUniformVec4ToGLSL(this.color, 'a_Color')
    send2DTextureToGLSL(this.texture, 0, 'u_Sampler')
    sendAttributeBufferToGLSL(this.uv_data, 2, 'a_TexCoord', 2, 0); //Sending the texture uv coordinates
    sendAttributeBufferToGLSL(this.data, 3, 'a_Position') //Sending the vertices
    sendAttributeBufferToGLSL(this.normal_data, 3, 'a_Normal') //Sending the normals
    sendUniformMatToGLSL(this.modelMatrix.elements, "u_modelMatrix")
    if(this instanceof Cube) {
      sendIndicesBufferToGLSL(this.indices)
      tellGLSLToDrawCurrentBuffer(36, ModesEnum.elements)
    } else {
      tellGLSLToDrawCurrentBuffer(this.vertices.length)
    }
  }

  /**
   * Responsible for updating the geometry's modelMatrix for animation.
   * Does nothing for non-animating geometry.
   */
  updateAnimation() {
    return;
  }
}
