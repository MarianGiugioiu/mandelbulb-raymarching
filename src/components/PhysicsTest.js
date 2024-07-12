import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Physics, Debug, useTrimesh, usePlane, useBox } from '@react-three/cannon';
import { BufferGeometry, Float32BufferAttribute, Uint32BufferAttribute, DoubleSide } from 'three';

const createPyramidGeometry = () => {
  const geometry = new BufferGeometry();
  const vertices = new Float32Array([
    // Base of the pyramid (square)
    -1, 0, -1,
    1, 0, -1,
    1, 0, 1,
    -1, 0, 1,
    // Tip of the pyramid
    0, 1, 0,
  ]);
  const indices = new Uint32Array([
    // Base
    0, 1, 2,
    2, 3, 0,
    // Sides
    0, 1, 4,
    1, 2, 4,
    2, 3, 4,
    3, 0, 4,
  ]);
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(new Uint32BufferAttribute(indices, 1));
  return geometry;
};

const Floor = () => {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -1, 0] }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
};

const Trimesh = ({ geometry }) => {
  const ref = useRef();
  useTrimesh(() => ({
    args: [geometry.attributes.position.array, geometry.index.array],
    mass: 1,
    position: [0, 0, 0],
    collisionFilterGroup: 1,
    collisionFilterMask: -1
  }), ref);
  return (
    <mesh ref={ref} geometry={geometry} position={[0, 0, 0]}>
      <meshStandardMaterial attach="material" color="orange" side={DoubleSide} />
    </mesh>
  );
};

const StaticBox = () => {
  const [ref] = useBox(() => ({ position: [2, 0.5, 2], mass: 1 }));
  return (
    <mesh ref={ref} position={[2, 0.5, 2]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

const ControllableBox = () => {
  const [ref, api] = useBox(() => ({ mass: 1, position: [0, 2, 0] }));
  const [position, setPosition] = useState([0, 2, 0]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'w':
          api.velocity.set(0, 0, -5);
          break;
        case 's':
          api.velocity.set(0, 0, 5);
          break;
        case 'a':
          api.velocity.set(-5, 0, 0);
          break;
        case 'd':
          api.velocity.set(5, 0, 0);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [api]);

  useEffect(() => {
    api.position.subscribe(setPosition);
  }, [api.position]);

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

export const PhysicsTest = () => {
  const pyramidGeometry = createPyramidGeometry();
  return (
    <Physics>
      <Debug color="black" scale={1.1}>
        <Floor />
        <Trimesh geometry={pyramidGeometry} />
        <ControllableBox />
        <StaticBox />
      </Debug>
    </Physics>
  )
}
