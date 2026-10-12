import React, { Fragment, forwardRef, useEffect, useRef, ReactNode } from 'react';
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

  const renderNode = (node: THREE.Object3D): ReactNode => {
    // uuid as key: stable and unique even for unnamed or duplicated nodes
    const key = node.uuid;

    const customRender = getCustom(node.name, custom);

    const extraProps =
      node.name === scene.name ? { ...props, ref: setSceneRefs, dispose: null } : {};

    const nodeProps = {
      ...extractProps(node),
      castShadow,
      receiveShadow,
      ...extraProps
    };

    const RGroup = forwardRef<THREE.Group, RGroupProps>(({ children, ...prs }, ref) => (
      <group ref={ref} {...nodeProps} {...prs}>
        {renderChildren()}
        {children}
      </group>
    ));

    const RMesh = forwardRef<THREE.Mesh, RMeshProps>(({ children, ...prs }, ref) => (
      <mesh ref={ref} {...nodeProps} {...prs}>
        {renderChildren()}
        {children}
      </mesh>
    ));

    const renderChildren = () => node.children.map(renderNode);

    // the key must live on the element that is returned into the
    // array, not on the inner host element, otherwise React warns about missing keys
    // @ts-ignore
    if (node.isMesh) {
      return customRender ? (
        <Fragment key={key}>{customRender(RMesh, node)}</Fragment>
      ) : (
        <RMesh key={key} />
      );
    }

    return customRender ? (
      <Fragment key={key}>{customRender(RGroup, node)}</Fragment>
    ) : (
      <RGroup key={key} />
    );
  };

  return renderNode(scene);
});
