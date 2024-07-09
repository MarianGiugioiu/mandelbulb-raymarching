export default /* glsl */ `
uniform float time; // Add time uniform
varying vec3 vNormal;
varying vec3 vPosition;

float mandelbulb(vec3 p) {
    float power = 20.0;
    vec3 z = p;
    float dr = 1.0;
    float r = 0.0;
    int iterations = 20; // Increased iterations for more detail

    for (int i = 0; i < iterations; i++) {
        r = length(z);
        if (r > 2.0) break;
        
        float theta = acos(z.z / r);
        float phi = atan(z.y, z.x);
        dr = pow(r, power - 1.0) * power * dr + 1.0;
        
        float zr = pow(r, power);
        theta *= power;
        phi *= power;
        
        z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
        z += p;
    }
    
    return 0.5 * log(r) * r / dr;
}

void main() {
    vNormal = normal;
    vPosition = position;

    float wave1 = sin(time + position.y * 2.0) * 0.1;
    float wave2 = cos(time * 0.5 + position.x * 3.0) * 0.1;
    float wave3 = sin(time * 0.25 + position.z * 4.0) * 0.1;

    vec3 displacedPosition = position + normal * (mandelbulb(position));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
`