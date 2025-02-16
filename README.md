# r3f-glb-handler

Wrapper around the gbl/gltf loader that allows handling and customizing only selected nodes in JSX instead of generating the full JSX file.

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
    // hade node:
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

  return <ManagedGLB path={glb} {...props} custom={custom} />;
};
```

TODO props, refs, stuct of {custom}, add demo
