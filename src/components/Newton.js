import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import vertexShader from '../shaders/newton/vertex.js';
import fragmentShader from '../shaders/newton/fragment.js';
import * as THREE from 'three';
import { Line, Text, Sphere } from '@react-three/drei';
import { useMemo } from 'react';
import { GUI } from 'dat.gui';

function Grid(props) {
  const { xMax, scaleFactor } = props;
  const step = 1 / 5;

  const values = useMemo(() => Array.from({ length: 7 }, (_, i) => i - 3), []);

  return (
    <>
      <Line
        points={[
          [-xMax * scaleFactor, 0, 1], // Start slightly outside -3
          [xMax * scaleFactor, 0, 1],  // End slightly outside 3
        ]}
        color="white"
        lineWidth={2}
      />

      <Line
        points={[
          [0, -xMax * scaleFactor, 1], // Start slightly outside -3
          [0, xMax * scaleFactor, 1],  // End slightly outside 3
        ]}
        color="white"
        lineWidth={2}
      />

      {/* Vertical Grid Lines with step size of 1/5 unit */}
      {Array.from({ length: 9 * 50 }, (_, i) => (i - 4 * 50)).map((value) => {
        return (
          <Line
            key={`grid-x-${value}`}
            points={[
              [value * step * scaleFactor, -xMax * scaleFactor, 1],
              [value * step * scaleFactor, xMax * scaleFactor, 1],
            ]}
            color="gray"
            lineWidth={1}
          />
        );
      })}

      {Array.from({ length: 9 * 50 }, (_, i) => (i - 4 * 50)).map((value) => {
        return (
          <Line
            key={`grid-y-${value}`}
            points={[
              -xMax * scaleFactor, value * step * scaleFactor, 1,
              xMax * scaleFactor, value * step * scaleFactor, 1,
            ]}
            color="gray"
            lineWidth={1}
          />
        );
      })}

      {values.map((value) => {
        return (
          <>
            <Text
              key={value + "-x"}
              position={[value * scaleFactor - 0.3, -0.3, 0]} // X-axis label below
              fontSize={0.3}
              color="white"
              textAlign="center"
            >
              {value}
            </Text>
            {value !== 0 ? (
              <Text
                key={value + "-y"}
                position={[-0.3, value * scaleFactor - 0.3, 0]} // Y-axis label on the left
                fontSize={0.3}
                color="white"
                textAlign="center"
              >
                {value}
              </Text>
            ) : null}
          </>
        );
      })}
    </>
  );
}

function Points(props) {
  const { points, setPoints, xMax, yMax, scaleFactor, height, width } = props;

  const handleMouseDown = (index, event) => {
    const startX = event.clientX;
    const startY = event.clientY;
    const xScaleFactor = xMax * 2 / width;

    const onMouseMove = (moveEvent) => {
      if (event.button !== 0) {
        return;
      }
      
      const deltaX = (moveEvent.clientX - startX) * xScaleFactor;
      const deltaY = (moveEvent.clientY - startY) * xScaleFactor;

      const newX = points[index].x + deltaX;
      const newY = points[index].y - deltaY;

      const updatedPoints = [...points];
      updatedPoints[index] = {
        x: newX,
        y: newY,
      };

      setPoints(updatedPoints);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };
  return (
    <>
      {points.map((point, index) => {
        const position = [point.x * scaleFactor, point.y * scaleFactor, 1];

        return (
          <Sphere
            key={index}
            args={[0.1]}
            position={position}
            onPointerDown={(e) => handleMouseDown(index, e.nativeEvent)} // Start dragging on pointer down
          >
            <meshStandardMaterial color="blue" />
          </Sphere>
        );
      })}
    </>
  )
}

function NewtonFractal(props) {
  const { viewport } = useThree();
  const { points, scaleFactor, zMin, zMax } = props;
  const values = new Array(10).fill(new THREE.Vector2());
  points?.map((point, index) => values[index] = new THREE.Vector2(point.x * scaleFactor, point.y * scaleFactor));

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_root_count: { value: points?.length },
      u_roots: { value: values },
      u_z_min: { value: new THREE.Vector2(zMin.x, zMin.y) },
      u_z_max: { value: new THREE.Vector2(zMax.x, zMax.y) },
      u_colors: {
        value: [
          new THREE.Color('red'),
          new THREE.Color('blue'),
          new THREE.Color('green'),
          new THREE.Color('yellow'),
          new THREE.Color('purple'),
          new THREE.Color('cyan'),
          new THREE.Color('magenta'),
          new THREE.Color('orange'),
          new THREE.Color('lime'),
          new THREE.Color('pink')
        ]
      },
    },
    vertexShader,
    fragmentShader
  });

  useEffect(() => {
    const values = new Array(10).fill(new THREE.Vector2());
    points?.map((point, index) => values[index] = new THREE.Vector2(point.x * scaleFactor, point.y * scaleFactor));
    shaderMaterial.uniforms.u_roots.value = values;
  }, [points]);

  // useEffect(() => {
  //   shaderMaterial.uniforms.u_z_min.value = new THREE.Vector2(-xMax, -yMax);
  //   shaderMaterial.uniforms.u_z_max.value = new THREE.Vector2(xMax, yMax);
  // }, [yMax]);

  useEffect(() => {
    shaderMaterial.uniforms.u_z_min.value = new THREE.Vector2(zMin.x, zMin.y);
    shaderMaterial.uniforms.u_z_max.value = new THREE.Vector2(zMax.x, zMax.y);
  }, [zMin, zMax]);
  return (
    <>
      {points?.length ? (<mesh>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <primitive object={shaderMaterial} attach="material" />
      </mesh>) : null}
    </>
  );
}

export default function Newton(props) {
  const [pointsNumber, setPointsNumber] = useState(5);
  const [points, setPoints] = useState([]);
  const { viewport } = useThree();
  const { canvasRef, zoom } = props;
  const { width, height } = canvasRef.current.getBoundingClientRect();

  const [ xMax, setXMax] = useState(3.4);
  const scaleFactorValue = viewport.width / (2 * 3.4);
  const yMaxValue = viewport.height / (2 * scaleFactorValue);
  const [scaleFactor, setScaleFactor] = useState(scaleFactorValue);
  const [yMax, setYMax] = useState(yMaxValue);

  const [zMin, setZMin] = useState({ x: -xMax, y: -yMaxValue });
  const [zMax, setZMax] = useState({ x: xMax, y: yMaxValue });

  const [isPanning, setIsPanning] = useState(false);
  const [lastMouse, setLastMouse] = useState(null);

  const [zoomFactor, setZoomFactor] = useState(1);
  const [deltaX, setDeltaX] = useState(0);
  const [deltaY, setDeltaY] = useState(0);


  const generateRandomPoints = (numPoints) => {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const x = (Math.random() - 0.5) * (xMax - 1) / 0.5;
      const y = (Math.random() - 0.5) * (yMax - 1) / 0.5;
      points.push({ x, y });
    }
    return points;
  };

  // useFrame(({ clock }) => {
  //   const elapsedTime = clock.getElapsedTime() / 1000;
  //   const newPoints = points.map(point => {
  //     point.x += (Math.random() > 0.5 ? 1 : -1) * Math.sin(elapsedTime) / 100;
  //     point.y += (Math.random() > 0.5 ? 1 : -1) * Math.cos(elapsedTime) / 100;
  //     return point
  //   });

  //   setPoints(newPoints);
  // });

  const handleMouseDown = (event) => {
    if (event.button === 2) {
      setIsPanning(true);
      setLastMouse({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setLastMouse(null);
  };

  const handleMouseMove = (event) => {
    if (isPanning && lastMouse) {
      const xScaleFactor = xMax * 2 / width;
      const dx = (event.clientX - lastMouse.x) * xScaleFactor;
      const dy = (event.clientY - lastMouse.y) * xScaleFactor;
      setDeltaX(dx);
      setDeltaY(dy);
      setLastMouse({ x: event.clientX, y: event.clientY });
    }
  };

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPanning, lastMouse]);

  useEffect(() => {
    const preventContextMenu = (event) => event.preventDefault();

    window.addEventListener('contextmenu', preventContextMenu);
    return () => {
      window.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);

  useEffect(() => {
    const gui = new GUI();

    gui.add({ pointsNumber }, "pointsNumber", 2, 10, 1).onChange((value) => {
      setPointsNumber(value);
    });

    return () => gui.destroy();
  }, []);

  useEffect(() => {
    const zoomIn = zoom < 0;
    let zoomFactorVal = 1.05;
    if (zoomIn) {
      zoomFactorVal = 0.95;
    }
    setZoomFactor(prevVal => prevVal * zoomFactorVal);
    setXMax(prevXMax => prevXMax * zoomFactorVal);
    // setZMin(prev => ({ x: prev.x * zoomFactor, y: prev.y * zoomFactor }));
    // setZMax(prev => ({ x: prev.x * zoomFactor, y: prev.y * zoomFactor }));
  }, [zoom])

  useEffect(() => {
    setScaleFactor(viewport.width / (2 * xMax))
  }, [xMax]);

  useEffect(() => {
    setYMax(viewport.height / (2 * scaleFactor));
  }, [scaleFactor]);

  useEffect(() => {
    setPoints(generateRandomPoints(pointsNumber));
  }, [pointsNumber]);

  useEffect(() => {
    setPoints(prev => prev.map(point => {
      point.x += deltaX;
      point.y -= deltaY;
      return point;
    }));
  }, [deltaX, deltaY])

  return (
    <>
      <NewtonFractal points={points} scaleFactor={scaleFactor} xMax={xMax} yMax={yMax} zMax={zMax} zMin={zMin} deltaX={deltaX} deltaY={deltaY} />
      {/* <Grid xMax={xMax} scaleFactor={scaleFactor} /> */}
      <Points points={points} setPoints={setPoints} xMax={xMax} yMax={yMax} width={width} height={height} scaleFactor={scaleFactor} />
    </>
  )
}