export default /* glsl */ `
varying vec2 vUv;
    uniform float u_zoom;
    uniform vec2 u_translation;

    void main() {
      vec2 c = (vUv - 0.5) * 4.0 / u_zoom - u_translation;

      vec2 z = vec2(0.0);
      int maxIter = 100;
      int i;
      for (i = 0; i < maxIter; ++i) {
        if (length(z) > 2.0) break;
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
      }

      float t = float(i) / float(maxIter);
      vec3 color;

      // Smooth coloring
      float log_zn = log(dot(z, z)) / 2.0;
      float nu = log(log_zn / log(2.0)) / log(2.0);
      float smoothColor = float(i) + 1.0 - nu;
      float colorValue = smoothColor / float(maxIter);

      float hue = t;
      float saturation = 1.0;
      float lightness = 0.5;

      color = vec3(
        abs(sin(6.0 * hue + 0.0) - 0.5) * 2.0 * saturation * lightness,
        abs(sin(6.0 * hue + 2.0) - 0.5) * 2.0 * saturation * lightness,
        abs(sin(6.0 * hue + 4.0) - 0.5) * 2.0 * saturation * lightness
      );

      if (i == maxIter) {
        color = vec3(0.0);
      }

      gl_FragColor = vec4(color, 1.0);
    }
`