export default /* glsl */ `
  precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_roots[10]; // Maximum supported roots
uniform vec3 u_colors[10];
uniform int u_root_count;
uniform vec2 u_z_min;
uniform vec2 u_z_max;

vec2 complexDiv(vec2 a, vec2 b) {
    float denominator = b.x * b.x + b.y * b.y;
    return vec2((a.x * b.x + a.y * b.y) / denominator, (a.y * b.x - a.x * b.y) / denominator);
}

vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

void main() {
    vec2 z = u_z_min + (gl_FragCoord.xy / u_resolution) * (u_z_max - u_z_min);
    const int maxIter = 50;
    float tol = 1e-6;

    for (int i = 0; i < maxIter; i++) {
        vec2 fz = vec2(1.0, 0.0);
        vec2 dfz = vec2(0.0, 0.0);

        for (int j = 0; j < u_root_count; j++) {
            vec2 term = z - u_roots[j];
            dfz = complexMul(dfz, term) + fz;
            fz = complexMul(fz, term);
        }

        vec2 dz = complexDiv(fz, dfz);
        z = z - dz;

        for (int j = 0; j < u_root_count; j++) {
            if (length(z - u_roots[j]) < tol) {
                gl_FragColor = vec4(u_colors[j], 1.0);
                return;
            }
        }
    }
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
`