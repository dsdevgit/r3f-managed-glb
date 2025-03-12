import { ReactNode } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export interface RGroupProps {
  children?: ReactNode;
  [key: string]: any;
}

export interface RMeshProps {
  children?: ReactNode;
  [key: string]: any;
}

export interface ManagedGLBProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  children?: ReactNode;
  [key: string]: any;
}

export type GLTFResult = GLTF & {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
};
