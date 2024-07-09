export default /* glsl */ `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

const int MAX_STEPS = 100;
const float MAX_DISTANCE = 100.0;
const float SURFACE_DISTANCE = 0.001;

// Function to apply rotation around the Y axis
mat3 rotateY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        c, 0.0, -s,
        0.0, 1.0, 0.0,
        s, 0.0, c
    );
}

// Function to apply rotation around the X axis
mat3 rotateX(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        1.0, 0.0, 0.0,
        0.0, c, -s,
        0.0, s, c
    );
}

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

// Function to convert HSV to RGB
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Function to calculate lighting and color
vec3 getColor(vec3 p, vec3 normal) {
    vec3 lightPos = vec3(5.0, 5.0, 5.0);
    vec3 lightDir = normalize(lightPos - p);
    float diff = max(dot(normal, lightDir), 0.0);

    // Calculate color based on position and time
    float hue = mod(length(p) + u_time * 0.1, 1.0);
    vec3 color = hsv2rgb(vec3(hue, 1.0, diff));

    return color;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;

    vec3 ro = vec3(0.0, 0.0, 5.0); // Ray origin
    vec3 rd = normalize(vec3(uv, -1.0)); // Ray direction

    // Calculate rotation angle based on mouse position
    float rotationY = (u_mouse.x / u_resolution.x - 0.5) * 6.28; // Rotate around Y-axis based on mouse X position
    float rotationX = (u_mouse.y / u_resolution.y - 0.5) * 6.28; // Rotate around X-axis based on mouse Y position

    // Rotate the position being evaluated in the Mandelbulb distance function
    vec3 rayDir = rd;
    float distance = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rayDir * distance;
        // Apply rotations to the position
        p = rotateY(rotationY) * p;
        p = rotateX(rotationX) * p;
        float d = mandelbulb(p);
        distance += d;
        if (d < SURFACE_DISTANCE || distance > MAX_DISTANCE) break;
    }

    if (distance < MAX_DISTANCE) {
        vec3 p = ro + rayDir * distance;
        // Apply rotations to the position for normal calculation
        p = rotateY(rotationY) * p;
        p = rotateX(rotationX) * p;
        vec3 normal = getNormal(p);
        vec3 color = getColor(p, normal);
        gl_FragColor = vec4(color, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Background color
    }
}

`