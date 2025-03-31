import React, { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
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
          [-xMax * scaleFactor, 0, 1],
          [xMax * scaleFactor, 0, 1],
        ]}
        color="white"
        lineWidth={2}
      />

      <Line
        points={[
          [0, -xMax * scaleFactor, 1],
          [0, xMax * scaleFactor, 1],
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
              position={[value * scaleFactor - 0.3, -0.3, 0]}
              fontSize={0.3}
              color="white"
              textAlign="center"
            >
              {value}
            </Text>
            {value !== 0 ? (
              <Text
                key={value + "-y"}
                position={[-0.3, value * scaleFactor - 0.3, 0]}
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
  const { points, setPoints, xMax, scaleFactor, width } = props;

  const handleMouseDown = (index, event) => {
    if (event.button !== 0) {
      return;
    }
    const startX = event.clientX;
    const startY = event.clientY;
    const xScaleFactor = xMax * 2 / width;

    const onMouseMove = (moveEvent) => {
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
            onPointerDown={(e) => handleMouseDown(index, e.nativeEvent)}
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
  }, [points, scaleFactor]);

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

  const [xMax, setXMax] = useState(3.4);
  const scaleFactorValue = viewport.width / (2 * 3.4);
  const yMaxValue = viewport.height / (2 * scaleFactorValue);
  const [scaleFactor, setScaleFactor] = useState(scaleFactorValue);
  const [yMax, setYMax] = useState(yMaxValue);

  const [zMin] = useState({ x: -xMax, y: -yMaxValue });
  const [zMax] = useState({ x: xMax, y: yMaxValue });

  const generateRandomPoints = (numPoints) => {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const x = (Math.random() - 0.5) * (xMax - 1) / 0.5;
      const y = (Math.random() - 0.5) * (yMax - 1) / 0.5;
      points.push({ x, y });
    }
    return points;
  };

  const handleMouseDownRef = useRef(null);
  useEffect(() => {
    handleMouseDownRef.current = (event) => {
      if (event.button !== 2) {
        return;
      }
      const startX = event.clientX;
      const startY = event.clientY;
      const xScaleFactor = xMax * 2 / width;

      const onMouseMove = (moveEvent) => {

        const deltaX = (moveEvent.clientX - startX) * xScaleFactor;
        const deltaY = (moveEvent.clientY - startY) * xScaleFactor;
        const updatedPoints = points.map(point => {
          return {
            x: point.x + deltaX,
            y: point.y - deltaY,
          };
        });

        setPoints(updatedPoints);
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };
  }, [points, xMax, width]);

  useEffect(() => {
    const preventContextMenu = (event) => event.preventDefault();
    window.addEventListener('contextmenu', preventContextMenu);
    const handler = (event) => {
      handleMouseDownRef.current?.(event);
    };
    window.addEventListener("mousedown", handler);

    return () => {
      window.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener("mousedown", handler);
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
    setXMax(prevXMax => prevXMax * zoomFactorVal);
  }, [zoom]);

  useEffect(() => {
    setScaleFactor(viewport.width / (2 * xMax))
  }, [xMax, viewport]);

  useEffect(() => {
    setYMax(viewport.height / (2 * scaleFactor));
  }, [scaleFactor, viewport]);

  useEffect(() => {
    setPoints(generateRandomPoints(pointsNumber));
  }, [pointsNumber]);

  return (
    <>
      <NewtonFractal points={points} scaleFactor={scaleFactor} xMax={xMax} yMax={yMax} zMax={zMax} zMin={zMin} />
      {/* <Grid xMax={xMax} scaleFactor={scaleFactor} /> */}
      <Points points={points} setPoints={setPoints} xMax={xMax} yMax={yMax} width={width} height={height} scaleFactor={scaleFactor} />
    </>
  )
}