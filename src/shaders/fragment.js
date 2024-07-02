export default /* glsl */ `
uniform float time; // Add time uniform
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);

  // vec3 color = vec3(
  //     0.5 * sin(time + vPosition.x) + 0.5,
  //     0.5 * sin(time + vPosition.y) + 0.5,
  //     0.5 * sin(time + vPosition.z) + 0.5
  // );

  // gl_FragColor = vec4(color, 1.0);
}
`