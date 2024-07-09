import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from '../shaders/mandelbulb/vertex.js';
import fragmentShader from '../shaders/mandelbulb/fragment.js';

export default function Mandelbulb() {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // meshRef.current.rotation.y += 0.01;
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 100]} />
      <shaderMaterial 
        ref={materialRef}
        side={THREE.DoubleSide}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ time: { value: 0 } }}
      />
    </mesh>
  );
}