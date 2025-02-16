import React, { useEffect, forwardRef } from "react";
import { useGLTF } from "@react-three/drei";

const getProps = (node) => {
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
      path,
      debug,
      onInit,
      castShadow = true,
      recieveShadow = true,
      ...props
    },
    fwdRef
  ) => {
    const { scene } = useGLTF(path);

    useEffect(() => {
      if (scene) {
        onInit?.(scene);
      }
    }, [scene]);

    if (debug) console.log(scene);

    const renderNode = (node) => {
      const customRender = custom[node.name];

      const extraProps =
        node.name === scene.name ? { ...props, ref: fwdRef } : {}; // provide main props to the root node

      const nodeProps = {
        ...getProps(node),
        ...castShadow,
        ...recieveShadow,
        ...extraProps,
      };

      const RGroup = forwardRef(({ children, ...prs }, ref) => (
        <group ref={ref} key={node.name} {...nodeProps} {...prs}>
          {renderChildren()}
          {children}
        </group>
      ));

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
