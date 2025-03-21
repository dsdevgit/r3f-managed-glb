import React, { useEffect, forwardRef, useRef, ReactNode, ReactElement, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { Object3DNode } from '@react-three/fiber';
import { ManagedGLBProps, GLTFResult } from './types';
import { getCustom, extructProps } from './utils';

export const ManagedGLB = forwardRef<THREE.Object3D, ManagedGLBProps>((props, fwdRef) => {
  const { custom = {}, path, debug, onInit, castShadow = true, recieveShadow = true } = props;
  const sceneRef = useRef<THREE.Object3D | null>(null);
  const gltf = useGLTF(path) as unknown as GLTFResult;
  const { scene, animations } = gltf;
  const { actions } = useAnimations(animations, sceneRef);

  useEffect(() => {
    if (scene) {
      onInit?.({ scene, animations, actions });
    }
  }, [scene]);

  if (debug) console.log(scene);

  const setSceneRefs = (element: THREE.Object3D | null) => {
    if (fwdRef) {
      if (typeof fwdRef === 'function') {
        fwdRef(element);
      } else {
        fwdRef.current = element;
      }
    }
    sceneRef.current = element;
  };

  const renderNode = (node: THREE.Object3D): ReactElement | null => {
    const customRender = getCustom(node.name, custom);

    // some props for the root node, will empty when node is not root
    const extraProps =
      node.name === scene.name ? { ...props, ref: setSceneRefs, dispose: null } : {};

    const nodeProps = {
      ...extructProps(node),
      ...castShadow,
      ...recieveShadow,
      ...extraProps
    };

    const RGroup = useMemo(
      () =>
        forwardRef<THREE.Group, Object3DNode<THREE.Group, typeof THREE.Group>>(
          ({ children, ...prs }, ref) => {
            return (
              <group ref={ref} key={node.name} {...nodeProps} {...prs}>
                {renderChildren()}
                {children}
              </group>
            );
          }
        ),
      [node.name, nodeProps]
    );

    const RMesh = useMemo(
      () =>
        forwardRef<THREE.Mesh, Object3DNode<THREE.Mesh, typeof THREE.Mesh>>(
          ({ children, ...prs }, ref) => (
            <mesh ref={ref} key={node.name} {...nodeProps} {...prs}>
              {renderChildren()}
              {children}
            </mesh>
          )
        ),
      [node.name, nodeProps]
    );

    const renderChildren = () => node.children.map(renderNode);

    if (node instanceof THREE.Mesh) return customRender ? customRender(RMesh, node) : <RMesh />;

    return customRender ? customRender(RGroup, node) : <RGroup />;
  };

  return renderNode(scene);
});
