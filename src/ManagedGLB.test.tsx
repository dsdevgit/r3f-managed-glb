import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import * as THREE from 'three';
import TestRenderer, { act } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';
import { ManagedGLB, preloadGLB } from './ManagedGLB';

// React 18.3+ requires this flag for act() to work
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type TestState = {
  scene: THREE.Object3D | null;
  animations: THREE.AnimationClip[];
  actions: Record<string, unknown>;
  preloaded: string[]
};

// shared with the hoisted vi.mock factory through globalThis
// (the factory is hoisted above any top level declaration)
function getState(): TestState {
  const state = (globalThis as any).__managed_glb_test_state;
  if (!state) {
    (globalThis as any).__managed_glb_test_state = {
      scene: null,
      animations: [],
      actions: {},
      preloaded: []
    };
  }
  return (globalThis as any).__managed_glb_test_state;
}

const state = getState();

vi.mock('@react-three/drei', () => {
  const useGLTF = ((path: string) => ({
    scene: getState().scene,
    animations: getState().animations
  })) as any;
  useGLTF.preload = (path: string) => getState().preloaded.push(path);

  const useAnimations = (_animations: unknown, _ref: unknown) => ({
    actions: getState().actions
  }) as any;

  return { useGLTF, useAnimations };
});

function buildScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.name = 'root';

  const arm = new THREE.Group();
  arm.name = 'arm';

  const armMesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
  armMesh.name = 'arm_mesh';
  armMesh.position.set(0, 1, 0);

  const extra = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
  extra.name = 'extra';
  extra.position.set(1, 2, 3);

  arm.add(armMesh);
  scene.add(arm, extra);
  return scene;
}

type JsonNode = any;

function render(ui: React.ReactElement) {
  let renderer!: ReactTestRenderer;

  act(() => {
    // by default react-test-renderer resolves host refs through createNodeMock,
    // which returns null — provide a mock node so refs receive something real
    renderer = TestRenderer.create(ui, {
      createNodeMock: (element) => ({
        type: element.type as string,
        props: element.props
      })
    });
  });

  return {
    json: () => renderer.toJSON() as JsonNode,
    unmount: () => act(() => renderer.unmount())
  };
}

function nodesNamed(root: JsonNode, name: string): JsonNode[] {
  const found: JsonNode[] = [];
  const visit = (node: JsonNode) => {
    if (!node) return;
    for (const n of Array.isArray(node) ? node : [node]) {
      if (n?.props?.name === name) found.push(n);
      visit(n?.children);
    }
  };
  visit(root);
  return found;
}

function allNodes(root: JsonNode): JsonNode[] {
  const out: JsonNode[] = [];
  const visit = (node: JsonNode) => {
    if (!node) return;
    for (const n of Array.isArray(node) ? node : [node]) {
      if (n) {
        out.push(n);
        visit(n.children);
      }
    }
  };
  visit(root);
  return out;
}

describe('ManagedGLB', () => {
  beforeEach(() => {
    state.scene = buildScene();
    state.animations = [];
    state.actions = {};
    state.preloaded = [];
  });

  it('renders a group/mesh tree mirroring the glb scene', () => {
    const r = render(<ManagedGLB path="model.glb" />);
    const json = r.json();

    expect(json.type).toBe('group');
    expect(json.props.name).toBe('root');

    const arm = nodesNamed(json, 'arm')[0];
    expect(arm.type).toBe('group');
    expect(arm.children).toHaveLength(1);
    expect(arm.children[0].type).toBe('mesh');
    expect(arm.children[0].props.name).toBe('arm_mesh');

    const extra = nodesNamed(json, 'extra')[0];
    expect(extra.type).toBe('mesh');
    expect(extra.props.position.toArray()).toEqual([1, 2, 3]);
  });

  it('applies castShadow/receiveShadow to every node by default', () => {
    const json = render(<ManagedGLB path="model.glb" />).json();
    const all = allNodes(json);
    expect(all.length).toBeGreaterThanOrEqual(3);
    for (const n of all) {
      expect(n.props.castShadow).toBe(true);
      expect(n.props.receiveShadow).toBe(true);
    }
  });

  it('overrides castShadow/receiveShadow via props', () => {
    const json = render(
      <ManagedGLB path="model.glb" castShadow={false} receiveShadow={false} />
    ).json();
    for (const n of allNodes(json)) {
      expect(n.props.castShadow).toBe(false);
      expect(n.props.receiveShadow).toBe(false);
    }
  });

  it('does not produce React warnings about missing keys', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ManagedGLB path="model.glb" />);
    const messages = spy.mock.calls.map((args) => args.join(' '));
    expect(messages.some((m) => m.includes('unique key'))).toBe(false);
    spy.mockRestore();
  });

  describe('custom node handling', () => {
    it('overrides node props', () => {
      const custom = {
        extra: (Node: any) => <Node visible={false} scale={0.5} />
      };
      const json = render(<ManagedGLB path="model.glb" custom={custom} />).json();
      const extra = nodesNamed(json, 'extra')[0];
      expect(extra.props.visible).toBe(false);
      expect(extra.props.scale).toBe(0.5);
    });

    it('removes a node when the handler returns null', () => {
      const custom = {
        arm_mesh: () => null
      };
      const json = render(<ManagedGLB path="model.glb" custom={custom} />).json();
      expect(nodesNamed(json, 'arm_mesh')).toHaveLength(0);
      // parent stays
      expect(nodesNamed(json, 'arm')).toHaveLength(1);
    });

    it('supports pipe separated multi node selectors', () => {
      const custom = {
        'arm_mesh|extra': (Node: any) => <Node visible={false} />
      };
      const json = render(<ManagedGLB path="model.glb" custom={custom} />).json();
      expect(nodesNamed(json, 'arm_mesh')[0].props.visible).toBe(false);
      expect(nodesNamed(json, 'extra')[0].props.visible).toBe(false);
    });

    it('replaces a node with a completely different element', () => {
      const custom = {
        extra: () => React.createElement('pointLight', { intensity: 2 })
      };
      const json = render(<ManagedGLB path="model.glb" custom={custom} />).json();
      expect(nodesNamed(json, 'extra')).toHaveLength(0);
      const light = allNodes(json).find((n) => n.type === 'pointLight');
      expect(light.props.intensity).toBe(2);
    });
  });

  it('calls onInit with scene, animations and actions', () => {
    const onInit = vi.fn();
    render(<ManagedGLB path="model.glb" onInit={onInit} />);
    expect(onInit).toHaveBeenCalledTimes(1);
    expect(onInit).toHaveBeenCalledWith(
      expect.objectContaining({
        scene: state.scene,
        animations: state.animations,
        actions: state.actions
      })
    );
  });

  it('forwards the ref to the root scene element', () => {
    const ref = React.createRef<any>();
    render(<ManagedGLB path="model.glb" ref={ref} />);
    expect(ref.current).toBeTruthy();
    expect(ref.current.type).toBe('group');
  });

  it('preloadGLB delegates to useGLTF.preload', () => {
    preloadGLB('model.glb');
    expect(state.preloaded).toContain('model.glb');
  });
});
