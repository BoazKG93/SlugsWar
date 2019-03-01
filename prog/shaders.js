var ASSIGN4_VSHADER = `
uniform mat4 u_NormalMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;
uniform mat4 u_modelMatrix;
uniform vec3 u_directionalVector;
attribute vec3 a_Normal;
attribute vec4 a_Position;
attribute vec2 a_TexCoord;

varying vec2 v_TexCoord;
varying vec3 N;
varying vec3 L;
varying float v_Diffuse;
varying vec3 v_Position;

uniform vec4 a_Color;
uniform bool u_Clicked;
varying float v_Dist;
varying vec4 v_Color;

  void main() {

    //Diffuse light
    N = normalize(u_NormalMatrix * vec4(a_Normal, 1.0)).xyz;
    L = normalize(u_directionalVector);
    v_Diffuse = max(dot(N, L), 0.0);

    //Positions
    gl_Position = u_ProjMatrix * u_ViewMatrix * u_modelMatrix * a_Position;
    v_TexCoord = a_TexCoord;
    v_Position = u_directionalVector - (u_modelMatrix * a_Position).xyz;

    //FOG
    v_Dist = gl_Position.w;

    if (u_Clicked) {
      v_Color = a_Color;
    }


  }`;

  // Basic Fragment Shader that receives a single one color (point).
  var ASSIGN5_FSHADER = `
  precision mediump float;
  uniform sampler2D u_Sampler;
  varying vec2 v_TexCoord;
  //Lighting
  varying vec3 N;
  varying vec3 L;
  varying float v_Diffuse;
  varying vec3 v_Position;

  varying float v_Dist;
  varying vec4 v_Color;
  uniform bool u_Clicked;

  void main() {

    if(u_Clicked) {
      gl_FragColor = v_Color;
    } else {
      vec4 texelColor = texture2D(u_Sampler, v_TexCoord);

      vec3 u_FogColor = vec3(0,0,0);
      vec2 u_FogDist = vec2(2,10);

      float fogFactor = clamp((u_FogDist.y - v_Dist) / (u_FogDist.y - u_FogDist.x), 0.0, 1.0);


      //Colors
      vec3 ambientLight = vec3(1.0, 1.0, 1.0)*texelColor.rgb;
      vec3 diffuseColor = vec3(1.0, 1.0, 1.0)*texelColor.rgb;
      vec3 specularColor = vec3(1, 1, 1);


      // Compute the specular term
      vec3 R = reflect(-L, N);
      vec3 V = normalize(-v_Position);
      float specAngle = max(dot(R, V), 0.0);
      float specular = pow(specAngle, 0.7);
      vec3 Lighting = ambientLight + (diffuseColor * v_Diffuse) + (specular * specularColor);

      vec3 color = mix(u_FogColor, texelColor.rgb * Lighting, fogFactor);
      gl_FragColor = vec4(color , texelColor.a);
    }




  }`;
