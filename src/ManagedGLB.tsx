import React, { useEffect, forwardRef, useRef, ReactNode } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { RGroupProps, RMeshProps, ManagedGLBProps } from './types';
import { getCustom, extractProps } from './utils';

export const preloadGLB = (glb: string) => useGLTF.preload(glb);

export const ManagedGLB = forwardRef<THREE.Object3D, ManagedGLBProps>((props, fwdRef) => {
  const { custom = {}, path, debug, onInit, castShadow = true, receiveShadow = true } = props;
  const sceneRef = useRef<THREE.Object3D | null>(null);

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

  const renderNode = (node: THREE.Object3D): ReactNode | null => {
    const customRender = getCustom(node.name, custom);

    const extraProps =
      node.name === scene.name ? { ...props, ref: setSceneRefs, dispose: null } : {};

    const nodeProps = {
      ...extractProps(node),
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
});
