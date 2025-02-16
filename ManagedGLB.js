import React, { useEffect, forwardRef, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

const getProps = (node) => {
  // return node;
  return {
    name: node.name,
    animations: node.animations,
    position: node.position,
    rotation: node.rotation,
    scale: node.scale,
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
    // quaternion: node.quaternion,
    up: node.up,
    visible: node.visible,
    uuid: node.uuid,
    geometry: node.geometry,
  };
};

export const ManagedGLB = forwardRef(
  (
    {
      custom = {},
      src,
      debug,
      onInit,
      castShadow = true,
      recieveShadow = true,
      ...props
    },
    fwdRef
  ) => {
    const sceneRef = useRef();
    const { scene, animations } = useGLTF(src);
    const { actions } = useAnimations(animations, sceneRef);

    useEffect(() => {
      if (scene) {
        onInit?.({ scene, animations, actions });
      }
    }, [scene]);

    if (debug) console.log(scene);

    // to attach {fwdRef} and {sceneRef} to the root node of the scene
    const setSceneRefs = (element) => {
      if (fwdRef) fwdRef.current = element;
      sceneRef.current = element;
    };

    const renderNode = (node) => {
      const customRender = custom[node.name];

      const extraProps =
        node.name === scene.name ? { ...props, ref: setSceneRefs } : {};

      const nodeProps = {
        ...getProps(node),
        ...castShadow,
        ...recieveShadow,
        ...extraProps,
      };

      const RGroup = forwardRef(({ children, ...prs }, ref) => {
        return (
          <group ref={ref} key={node.name} {...nodeProps} {...prs}>
            {renderChildren()}
            {children}
          </group>
        );
      });

      const RMesh = forwardRef(({ children, ...prs }, ref) => (
        <mesh ref={ref} key={node.name} {...nodeProps} {...prs}>
          {renderChildren()}
          {children}
        </mesh>
      ));

      const renderChildren = () => node.children.map(renderNode);

      if (node.isMesh) {
        return customRender?.(RMesh, node) ?? <RMesh />;
      }

      return customRender?.(RGroup, node) ?? <RGroup />;
    };

    return renderNode(scene);
  }
);
