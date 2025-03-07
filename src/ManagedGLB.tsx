import { useEffect, forwardRef, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { RGroupProps, RMeshProps, ManagedGLBProps } from './types';

import * as THREE from 'three';

const getProps = (node: THREE.Object3D) => {
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
    up: node.up,
    visible: node.visible,
    uuid: node.uuid,
    // @ts-ignore
    geometry: node.geometry
  };
};

export const preloadGLB = (glb: string) => useGLTF.preload(glb);

export const ManagedGLB = forwardRef<THREE.Object3D<THREE.Object3DEventMap>, ManagedGLBProps>(
  (
    { custom = {}, path, debug, onInit, castShadow = true, receiveShadow = true, ...props },
    fwdRef
  ) => {
    const sceneRef = useRef<THREE.Object3D>(null);
    // @ts-ignore
    const { scene, animations } = useGLTF(path);
    const { actions } = useAnimations(animations, sceneRef);

    useEffect(() => {
      if (scene) {
        onInit?.({ scene, animations, actions });
      }
    }, [scene]);

    if (debug) console.log(scene);

    const setSceneRefs = (element: THREE.Object3D) => {
      // @ts-ignore
      if (fwdRef) fwdRef.current = element;
      sceneRef.current = element;
    };

    const renderNode = (node: THREE.Object3D) => {
      const customRender = custom[node.name];

      const extraProps =
        node.name === scene.name ? { ...props, ref: setSceneRefs, dispose: null } : {};

      const nodeProps = {
        ...getProps(node),
        ...castShadow,
        ...receiveShadow,
        ...extraProps
      };

      const RGroup = forwardRef<RGroupProps, RGroupProps>(({ children, ...prs }, ref) => {
        return (
          <group ref={ref} key={node.name} {...nodeProps} {...prs}>
            {renderChildren()}
            {children}
          </group>
        );
      });

      const RMesh = forwardRef<RMeshProps, RMeshProps>(({ children, ...prs }, ref) => (
        <mesh ref={ref} key={node.name} {...nodeProps} {...prs}>
          {renderChildren()}
          {children}
        </mesh>
      ));

      const renderChildren = () => node.children.map(renderNode);
      // @ts-ignore
      if (node.isMesh) {
        return customRender ? customRender(RMesh, node) : <RMesh />;
      }

      return customRender ? customRender(RGroup, node) : <RGroup />;
    };

    return renderNode(scene);
  }
);
