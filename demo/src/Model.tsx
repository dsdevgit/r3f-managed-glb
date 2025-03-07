import { useFrame } from '@react-three/fiber';
import { FC, useRef } from 'react';
import type { Mesh, Group } from 'three';
import { ManagedGLB } from 'managed-glb';

const glb = 'scene.glb';

export const Model: FC = () => {
  const group = useRef<Group | Mesh>(null);

  return <ManagedGLB glb={glb} ref={group} />;
};
