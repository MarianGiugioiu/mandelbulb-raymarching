import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import vertexShader from '../shaders/mandelbrot/vertex.js';
import fragmentShader from '../shaders/mandelbrot/fragment.js';
import * as THREE from 'three';

export default function Mandelbrot() {
  const meshRef = useRef();
  const materialRef = useRef();
  const { viewport } = useThree();
  const zoomRef = useRef(1.0);
  const isLeftMouseButtonDownRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0.0, y: 0.0 });

  const onMouseDown = useCallback((event) => {
    if (event.button === 0) {
      isLeftMouseButtonDownRef.current = true;
    }
    previousMousePositionRef.current.x = event.clientX;
    previousMousePositionRef.current.y = event.clientY;
  }, []);

  const onMouseUp = useCallback((event) => {
    if (event.button === 0) {
      isLeftMouseButtonDownRef.current = false;
    }
  }, []);

  const onMouseMove = useCallback((event) => {
    const deltaX = event.clientX - previousMousePositionRef.current.x;
    const deltaY = event.clientY - previousMousePositionRef.current.y;

    if (isLeftMouseButtonDownRef.current) {
      materialRef.current.uniforms.u_translation.value.x += (deltaX / window.innerWidth) * 4.0 / zoomRef.current;
      materialRef.current.uniforms.u_translation.value.y -= (deltaY / window.innerHeight) * 4.0 / zoomRef.current;
    }

    previousMousePositionRef.current.x = event.clientX;
    previousMousePositionRef.current.y = event.clientY;
  }, []);

  const onScroll = useCallback((event) => {
    zoomRef.current *= event.deltaY > 0 ? 0.9 : 1.1;
    materialRef.current.uniforms.u_zoom.value = zoomRef.current;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mouseup', onMouseUp, false);
    window.addEventListener('contextmenu', event => event.preventDefault(), false); // Prevent context menu
    window.addEventListener('wheel', onScroll, false);

    return () => {
      window.removeEventListener('mousemove', onMouseMove, false);
      window.removeEventListener('mousedown', onMouseDown, false);
      window.removeEventListener('mouseup', onMouseUp, false);
      window.removeEventListener('contextmenu', event => event.preventDefault(), false);
      window.removeEventListener('wheel', onScroll, false);
    };
  }, [onMouseMove, onMouseDown, onMouseUp, onScroll]);

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          u_zoom: { value: 1.0 },
          u_translation: { value: new THREE.Vector2(0.0, 0.0) }
        }}
      />
    </mesh>
  );
}