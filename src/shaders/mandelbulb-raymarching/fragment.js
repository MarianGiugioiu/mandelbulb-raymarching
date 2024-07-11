export default /* glsl */ `
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_zoom;
uniform vec2 u_translation;

#define PI 3.14159265359

const int MAX_STEPS = 100;
const float MAX_DISTANCE = 100.0;
const float SURFACE_DISTANCE = 0.001;

mat3 rotateY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        c, 0.0, -s,
        0.0, 1.0, 0.0,
        s, 0.0, c
    );
}

mat3 rotateX(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat3(
        1.0, 0.0, 0.0,
        0.0, c, -s,
        0.0, s, c
    );
}

float mandelbulb(vec3 pos) {
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;
    const int iterations = 8;
    for (int i = 0; i < iterations; i++) {
        r = length(z);
        if (r > 2.0) break;

        float theta = acos(z.z / r);
        float phi = atan(z.y, z.x);
        dr = pow(r, 7.0 - 1.0) * 7.0 * dr + 1.0;

        float zr = pow(r, 7.0);
        theta = theta * 7.0;
        phi = phi * 7.0;

        z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
        z += pos;
    }
    return 0.5 * log(r) * r / dr;
}

vec3 getNormal(vec3 p) {
    float d = mandelbulb(p);
    vec2 e = vec2(0.001, 0);
    vec3 n = d - vec3(
        mandelbulb(p - e.xyy),
        mandelbulb(p - e.yxy),
        mandelbulb(p - e.yyx));
    return normalize(n);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 getColor(vec3 p, vec3 normal) {
    vec3 lightPos = vec3(5.0, 5.0, 5.0);
    vec3 lightDir = normalize(lightPos - p);
    float diff = max(dot(normal, lightDir), 0.0);

    float hue = mod(length(p) + u_time * 0.1, 1.0);
    vec3 color = hsv2rgb(vec3(hue, 1.0, diff));

    return color;
}

float smoothMod(float axis, float amp, float rad){
    float top = cos(PI * (axis / amp)) * sin(PI * (axis / amp));
    float bottom = pow(sin(PI * (axis / amp)), 2.0) + pow(rad, 2.0);
    float at = atan(top / bottom);
    return amp * (1.0 / 2.0) - (1.0 / PI) * at;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;

    vec3 ro = vec3(0.0, 0.0, 5.0) / u_zoom;
    ro.xy += u_translation; // Apply translation
    vec3 rd = normalize(vec3(uv, -1.0));

    float rotationY = (u_mouse.x / u_resolution.x - 0.5) * 6.28;
    float rotationX = (u_mouse.y / u_resolution.y - 0.5) * 6.28;

    float distance = 0.0;
    vec3 p;

    for (int i = 0; i < MAX_STEPS; i++) {
        p = ro + rd * distance;
        p = rotateY(rotationY) * p;
        p = rotateX(rotationX) * p;

        // Apply smoother wave animation to the z coordinate
        p.z += smoothMod(sin(u_time * 2.0 + p.z * 4.0) * 0.2 * 1.0, 2.5, 1.5) - smoothMod(sin(p.z * 4.0) * 0.2 * 1.0, 2.5, 1.5);
        p.y += smoothMod(sin(u_time * 2.0 + p.y * 4.0) * 0.2 * 1.0, 2.5, 1.5) - smoothMod(sin(p.y * 4.0) * 0.2 * 1.0, 2.5, 1.5);
        p.x += smoothMod(sin(u_time * 2.0 + p.x * 4.0) * 0.2 * 1.0, 2.5, 1.5) - smoothMod(sin(p.x * 4.0) * 0.2 * 1.0, 2.5, 1.5);

        float d = mandelbulb(p);
        distance += d;
        if (d < SURFACE_DISTANCE || distance > MAX_DISTANCE) break;
    }

    if (distance < MAX_DISTANCE) {
        p = ro + rd * distance;
        p = rotateY(rotationY) * p;
        p = rotateX(rotationX) * p;

        // Apply smoother wave animation to the z coordinate
        p.z += smoothMod(sin(u_time * 2.0 + p.z * 4.0) * 0.2 * 1.0, 2.5, 1.5) - smoothMod(sin(p.z * 4.0) * 0.2 * 1.0, 2.5, 1.5);
        p.y += smoothMod(sin(u_time * 2.0 + p.y * 4.0) * 0.2 * 1.0, 2.5, 1.5) - smoothMod(sin(p.y * 4.0) * 0.2 * 1.0, 2.5, 1.5);
        p.x += smoothMod(sin(u_time * 2.0 + p.x * 4.0) * 0.2 * 1.0, 2.5, 1.5) - smoothMod(sin(p.x * 4.0) * 0.2 * 1.0, 2.5, 1.5);

        vec3 normal = getNormal(p);
        vec3 color = getColor(p, normal);
        gl_FragColor = vec4(color, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}


`