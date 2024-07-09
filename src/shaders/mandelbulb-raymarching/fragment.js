export default /* glsl */ `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

const int MAX_STEPS = 100;
const float MAX_DISTANCE = 100.0;
const float SURFACE_DISTANCE = 0.001;

// Function to calculate the distance estimator for the Mandelbulb
float mandelbulb(vec3 pos) {
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;
    const int iterations = 8;
    for (int i = 0; i < iterations; i++) {
        r = length(z);
        if (r > 2.0) break;

        // Convert to polar coordinates
        float theta = acos(z.z / r);
        float phi = atan(z.y, z.x);
        dr = pow(r, 7.0 - 1.0) * 7.0 * dr + 1.0;

        // Scale and rotate the point
        float zr = pow(r, 7.0);
        theta = theta * 7.0;
        phi = phi * 7.0;

        // Convert back to cartesian coordinates
        z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
        z += pos;
    }
    return 0.5 * log(r) * r / dr;
}

// Function to perform ray marching
float raymarch(vec3 ro, vec3 rd) {
    float distance = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * distance;
        float d = mandelbulb(p);
        distance += d;
        if (d < SURFACE_DISTANCE || distance > MAX_DISTANCE) break;
    }
    return distance;
}

// Function to calculate the normal at a point
vec3 getNormal(vec3 p) {
    float d = mandelbulb(p);
    vec2 e = vec2(0.001, 0);
    vec3 n = d - vec3(
        mandelbulb(p - e.xyy),
        mandelbulb(p - e.yxy),
        mandelbulb(p - e.yyx));
    return normalize(n);
}

// Function to calculate lighting
vec3 getLight(vec3 p, vec3 normal) {
    vec3 lightPos = vec3(5.0, 5.0, 5.0);
    vec3 lightDir = normalize(lightPos - p);
    float diff = max(dot(normal, lightDir), 0.0);
    return vec3(1.0, 0.8, 0.6) * diff; // Basic diffuse lighting
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;

    vec3 ro = vec3(0.0, 0.0, 5.0); // Ray origin
    vec3 rd = normalize(vec3(uv, -1.0)); // Ray direction

    float d = raymarch(ro, rd);
    if (d < MAX_DISTANCE) {
        vec3 p = ro + rd * d;
        vec3 normal = getNormal(p);
        vec3 color = getLight(p, normal);
        gl_FragColor = vec4(color, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Background color
    }
}
`