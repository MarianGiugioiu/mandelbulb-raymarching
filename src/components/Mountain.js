import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise';

const ThreeScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, controls;

    const init = () => {
      // Scene
      scene = new THREE.Scene();
      
      // Camera
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 50, 100);

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);

      // Orbit Controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.enableZoom = true;

      // Mountain Generation (Simple Perlin Noise example)
      const mountainGeometry = new THREE.ConeGeometry(30, 50, 64); // Adjust size and segments as needed

      // Apply Perlin noise for vertex manipulation
      const noise = new ImprovedNoise();
      const positions = mountainGeometry.attributes.position;

      for (let i = 0; i < positions.count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(positions, i);
        // Adjust noise parameters for smoother terrain
        const noiseValue = noise.noise(vertex.x * 0.07, vertex.y * 0.07, vertex.z * 0.07) * 5; // Scale noise value
        vertex.z += noiseValue;
        vertex.x += noiseValue;
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }

      positions.needsUpdate = true; // Notify Three.js that geometry has been modified

      // Shader material setup
      const vertexShader = `
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vNormal = normalMatrix * normal;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0)); // Example light direction
          float intensity = dot(vNormal, lightDir);

          // Heights for blending colors
          float snowHeight = 8.0; // Adjust as needed
          float forestHeight = -10.0; // Adjust as needed

          // Calculate blending factors based on height
          float snowFactor = smoothstep(snowHeight - 5.0, snowHeight + 5.0, vPosition.y);
          float forestFactor = smoothstep(forestHeight - 5.0, forestHeight + 5.0, vPosition.y);
          float rockFactor = 1.0 - snowFactor - forestFactor; // Remaining factor is snow

          // Interpolate colors based on factors
          vec3 rockColor = vec3(0.1, 0.3, 0.1); // Rocks (brownish)
          vec3 forestColor = vec3(0.1, 0.5, 0.1); // Forest (greenish)
          vec3 snowColor = vec3(1.0, 1.0, 1.0); // Snow (white)

          vec3 finalColor = rockFactor * rockColor + forestFactor * forestColor + snowFactor * snowColor;

          gl_FragColor = vec4(finalColor * intensity, 1.0);
        }
      `;

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        flatShading: true, // Flat shading for better terrain appearance
      });

      const mountain = new THREE.Mesh(mountainGeometry, material);
      scene.add(mountain);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(0, 1, 0);
      scene.add(directionalLight);

      // Animation Loop
      const animate = () => {
        requestAnimationFrame(animate);

        controls.update(); // Update controls for damping

        renderer.render(scene, camera);
      };

      animate();
    };

    init();

    // Resize handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default ThreeScene;
