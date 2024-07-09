import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from '../shaders/mandelbulb-raymarching/vertex.js';
import fragmentShader from '../shaders/mandelbulb-raymarching/fragment.js';

export default function MandelbulbRaymarching() {
  const meshRef = useRef();
  const materialRef = useRef();
  const { size, viewport } = useThree();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      materialRef.current.uniforms.u_time.value = clock.getElapsedTime();
    }
  });

  function onMouseMove(event) {
    materialRef.current.uniforms.u_mouse.value.x = event.clientX;
    materialRef.current.uniforms.u_mouse.value.y = event.clientY; // Invert Y axis
  }

  window.addEventListener('mousemove', onMouseMove, false);

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial 
        ref={materialRef}
        side={THREE.DoubleSide}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ 
          u_time: { value: 0 },
          u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          u_mouse: { value: new THREE.Vector2(0, 0) }
        }}
      />
    </mesh>
  );
}