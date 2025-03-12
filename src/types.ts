import { ReactNode, FC } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export interface RGroupProps {
  children?: ReactNode;
  [key: string]: any; // TODO: provide THREE.Object3D props
}

export interface RMeshProps {
  children?: ReactNode;
  [key: string]: any; // TODO: provide THREE.Object3D props
}

export interface ManagedGLBProps {
  path: string;
  custom?: Custom;
  onInit?: () => void;
  castShadow?: boolean;
  receiveShadow?: boolean;
  debug?: boolean;
  [key: string]: any; // TODO: provide THREE.Object3D props
}

export type Custom = {
  [key: string]: (Node: FC, node: THREE.Object3D) => ReactNode | null;
};

export type GLTFResult = GLTF & {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
};
