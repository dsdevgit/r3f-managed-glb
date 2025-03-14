import { Custom } from './types';
import * as THREE from 'three';

export const extractProps = (node: THREE.Object3D) => {
  // return node;
  return {
    name: node.name,
    animations: node.animations,
    position: node.position,
    rotation: node.rotation,
    scale: node.scale,
    // @ts-ignore
    material: node.material,
    userData: node.userData,
    matrix: node.matrix,
    matrixAutoUpdate: node.matrixAutoUpdate,
    matrixWorld: node.matrixWorld,
    matrixWorldAutoUpdate: node.matrixWorldAutoUpdate,
    matrixWorldNeedsUpdate: node.matrixWorldNeedsUpdate,
    castShadow: node.castShadow,
    receiveShadow: node.receiveShadow,
    renderOrder: node.renderOrder,
    // quaternion: node.quaternion, // breaks setting rotation via props.rotation
    up: node.up,
    visible: node.visible,
    uuid: node.uuid,
    // @ts-ignore
    geometry: node.geometry
  };
};

export const isIncluded = (name: string, string: string) => {
  const array = string.split('|');
  return array.includes(name);
};

export const getCustom = (name: string, custom: Custom) => {
  const keys = Object.keys(custom);
  const found = keys.find((key) => isIncluded(name, key));
  return found ? custom[found] : null;
};

export const meshesInNodeByCount = (nodeName: string, count: number = 10): string => {
  return Array.apply(null, Array(count))
    .map((_, index) => nodeName + '_' + (index + 1))
    .join('|');
};
