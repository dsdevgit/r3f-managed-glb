# Managed GLB for React Three Fiber (WIP)

Wrapper around the gbl/gltf loader that allows handling and customizing only selected nodes in JSX instead of generating the full JSX file.

Handling the nodes:

```javascript
import React from "react";
import { ManagedGLB } from "r3f-managed-glb";
import * as THREE from "three";

const glb = "assets/model.glb";

export const MyModel = (props) => {
  const custom = {
    // change material:
    ["node_001"]: (Node) => (
      <Node>
        <meshStandardMaterial
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </Node>
    ),

    // change scale (position, rotation, etc.):
    ["node_002"]: (Node) => <Node scale={0.1} />,

    // remove node:
    ["node_003"]: () => null,

    // hide node:
    ["node_004"]: (Node) => <Node visible={false} />,

    // dublicate node:
    ["node_005"]: (Node, node) => {
      const pos = [...node.position];
      pos[1] += 2;
      return (
        <>
          <Node />
          <Node position={pos} />
        </>
      );
    },
  };

  return <ManagedGLB src={glb} custom={custom} {...props} />;
};
```

Play animations from glb:

```javascript
import { ManagedGLB } from "./ManagedGLB";
import React, { useRef } from "react";

const glb = "assets/animated_model.glb";

export const Anim = ({ parts, ...props }) => {
  const actionsRef = useRef();

  const custom = {
    ["node_001"]: (Node) => (
      <Node onClick={() => actionsRef.current["my_action"].play()} />
    ),
  };

  return (
    <ManagedGLB
      onInit={({ actions }) => (actionsRef.current = actions)}
      src={glb}
      custom={custom}
      {...props}
    />
  );
};
```

TODO readme: props, refs, stuct of {custom}
TODO project: webpack cfg, publish npm package, add demo
