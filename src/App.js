import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Mandelbulb from './components/Mandelulb.js';
import PlaneComponent from './components/PlaneComponent.js';
import MandelbulbRaymarching from './components/MandelbulbRaymarching.js';
import { PhysicsTest } from './components/PhysicsTest.js';

function App() {
  return (
    <Canvas style={{ width: '100%', height: '100vh' }} shadows>
      <ambientLight intensity={0.2}/>
      <pointLight position={[10, 10, 10]} castShadow intensity={0.8}/>
      <MandelbulbRaymarching />
      {/* <Mandelbulb /> */}
      {/* <PlaneComponent /> */}
      {/* <OrbitControls /> */}
      {/* <PhysicsTest /> */}
    </Canvas>
  );
}

export default App;
