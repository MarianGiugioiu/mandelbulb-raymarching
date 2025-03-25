import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Mandelbulb from './components/Mandelulb.js';
import PlaneComponent from './components/PlaneComponent.js';
import MandelbulbRaymarching from './components/MandelbulbRaymarching.js';
import { PhysicsTest } from './components/PhysicsTest.js';
import Mandelbrot from './components/Mandelbrot.js';
import Newton from './components/Newton.js';
import { OrthographicCamera } from '@react-three/drei';

function App() {
  const [ zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);

  const handleZoom = (event) => {
    const zoomIn = event.deltaY < 0;
    let zoomFactor = 1.05;
    if (zoomIn) {
      zoomFactor = -1.05;
    }
    setZoom(prevZoom => Math.abs(prevZoom) * zoomFactor);
  };

  return (
    <Canvas ref={canvasRef} style={{ width: '100%', height: '100vh' }} shadows onWheel={handleZoom}>
      <ambientLight intensity={0.2}/>
      <pointLight position={[10, 10, 10]} castShadow intensity={0.8}/>
      <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={100} />
      {/* <MandelbulbRaymarching /> */}
      {/* <Mandelbrot/> */}
      {/* <Mandelbulb /> */}
      {/* <PlaneComponent /> */}
      {/* <OrbitControls/> */}
      {/* <PhysicsTest /> */}
      <Newton canvasRef={canvasRef} zoom={zoom}/>
    </Canvas>
  );
}

export default App;
