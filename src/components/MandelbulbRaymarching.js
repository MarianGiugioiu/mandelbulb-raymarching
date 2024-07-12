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
      const elapsedTime = clock.getElapsedTime();
    
      // Oscillate between 3 and 20 using the sine function
      const min = 3;
      const max = 15;
      const startValue = 3;
      const range = (max - min) / 2;
      const mid = (max + min) / 2;
      const startPhase = Math.asin((startValue - mid) / range);
      const value = mid + range * Math.sin(elapsedTime / 10 + startPhase);
      materialRef.current.uniforms.u_power.value = value;
      materialRef.current.uniforms.u_time.value = elapsedTime;
    }
  });

  let zoom = 1.0;
  let isRightMouseButtonDown = false;
  let isLeftMouseButtonDown = false;
  let previousMousePosition = { x: 0, y: 0 };

  function onMouseDown(event) {
    if (event.button === 2) { // Right mouse button
      isRightMouseButtonDown = true;
    } else if (event.button === 0) { // Left mouse button
      isLeftMouseButtonDown = true;
    }
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
  }

  function onMouseUp(event) {
    if (event.button === 2) { // Right mouse button
      isRightMouseButtonDown = false;
    } else if (event.button === 0) { // Left mouse button
      isLeftMouseButtonDown = false;
    }
  }

  function onMouseMove(event) {
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;

    if (isRightMouseButtonDown) {
      materialRef.current.uniforms.u_mouse.value.x += deltaX;
      materialRef.current.uniforms.u_mouse.value.y += deltaY;
    } else if (isLeftMouseButtonDown) {
      materialRef.current.uniforms.u_translation.value.x += deltaX / window.innerWidth * 2;
      materialRef.current.uniforms.u_translation.value.y -= deltaY / window.innerHeight * 2;
    }

    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
  }

  function onScroll(event) {
    zoom *= event.deltaY > 0 ? 0.9 : 1.1;
    materialRef.current.uniforms.u_zoom.value = zoom;
  }

  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('mousedown', onMouseDown, false);
  window.addEventListener('mouseup', onMouseUp, false);
  window.addEventListener('contextmenu', event => event.preventDefault(), false); // Prevent context menu
  window.addEventListener('wheel', onScroll, false);

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
          u_mouse: { value: new THREE.Vector2(0, 0) },
          u_zoom: { value: 1.0 },
          u_translation: { value: new THREE.Vector2(0, 0) },
          u_power: { value: 7.0 }
        }}
      />
    </mesh>
  );
}