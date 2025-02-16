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

/*

Usage:
-----------------------------

import React from "react";
import { RenderGLB } from "./RenderGLB";
import { useAttach } from "core/src/templates/3d-scene-builder/hooks/useAttach";
import * as THREE from "three";

const glb = "assets/windmill.glb";

export const Windmill = ({ parts, ...props }) => {
  const { isAttached } = useAttach(parts);

  const custom = {
    ["box_left"]: (Node) => (
      <Node>
        <meshStandardMaterial
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </Node>
    ),
    ["blades"]: (Node) => (
      <Node scale={0.1} visible={isAttached("id_lopasti")} />
    ),
    ["rotator"]: (Node) => <Node visible={isAttached("id_system")} />,
    ["generator"]: (Node) => <Node visible={isAttached("id_generator")} />,
    ["val"]: (Node) => <Node visible={isAttached("id_glav_val")} />,
  };

  return <RenderGLB path={glb} {...props} custom={custom} />;
};

*/

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
