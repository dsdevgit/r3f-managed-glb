import { ReactNode } from 'react';
import { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

export interface RGroupProps {
  children?: ReactNode;
  [key: string]: any; // Для остальных пропсов
}

export interface RMeshProps {
  children?: ReactNode;
  [key: string]: any; // Для остальных пропсов
}

export interface ManagedGLBProps {
  url: string; // Путь к файлу GLB
  position?: [number, number, number]; // Позиция модели
  rotation?: [number, number, number]; // Поворот модели
  scale?: [number, number, number]; // Масштаб модели
  children?: ReactNode; // Дочерние элементы (если есть)
  [key: string]: any; // Для остальных пропсов
}

export type GLTFResult = GLTF & {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
};
