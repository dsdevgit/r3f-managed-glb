import { FC, ReactElement } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

// TODO: make it as extension of Object3DNode?
export interface ManagedGLBProps {
  path: string;
  custom?: Custom;
  onInit?: () => void;
  castShadow?: boolean;
  receiveShadow?: boolean;
  debug?: boolean;
  [key: string]: any;
}

export type Custom = {
  [key: string]: (Node: FC, node: THREE.Object3D) => ReactElement | null;
};

export type GLTFResult = GLTF & {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
};
