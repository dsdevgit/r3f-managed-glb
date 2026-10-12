import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { extractProps, getCustom, isIncluded, meshesInNodeByCount } from './utils';

describe('isIncluded', () => {
  it('matches the node name inside a pipe separated selector', () => {
    expect(isIncluded('arm_upper', 'arm_lower|arm_upper|arm_uppers')).toBe(true);
  });

  it('does not match other names', () => {
    expect(isIncluded('hand', 'arm_lower|arm_upper')).toBe(false);
  });

  it('does not match substrings', () => {
    expect(isIncluded('arm', 'arm_lower|arm_upper')).toBe(false);
  });
});

describe('getCustom', () => {
  const renderArm = () => null;
  const renderHand = () => null;

  it('returns the handler of the matching selector', () => {
    const custom = {
      arm: renderArm,
      'hand|finger': renderHand
    };
    expect(getCustom('arm', custom)).toBe(renderArm);
    expect(getCustom('hand', custom)).toBe(renderHand);
    expect(getCustom('finger', custom)).toBe(renderHand);
  });

  it('returns null for unknown node names', () => {
    const custom = {
      arm: renderArm,
      'hand|finger': renderHand
    };
    expect(getCustom('leg', custom)).toBeNull();
  });
});

describe('meshesInNodeByCount', () => {
  it('builds a pipe selector for n numbered node names', () => {
    expect(meshesInNodeByCount('part', 3)).toBe('part_1|part_2|part_3');
  });

  it('defaults to 10 nodes', () => {
    expect(meshesInNodeByCount('part').split('|')).toHaveLength(10);
  });
});

describe('extractProps', () => {
  it('extracts transform, material and rendering props from a node', () => {
    const geometry = new THREE.BoxGeometry(1, 2, 3);
    const material = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'box';
    mesh.position.set(1, 2, 3);
    mesh.rotation.set(Math.PI / 2, 0, 0);
    mesh.scale.set(0.5, 0.5, 0.5);
    mesh.visible = false;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = 42;
    mesh.userData.source = 'test';

    const props = extractProps(mesh);

    expect(props.name).toBe('box');
    expect(props.position).toBe(mesh.position);
    expect(props.rotation).toBe(mesh.rotation);
    expect(props.scale).toBe(mesh.scale);
    expect(props.geometry).toBe(geometry);
    expect(props.material).toBe(material);
    expect(props.visible).toBe(false);
    expect(props.castShadow).toBe(false);
    expect(props.receiveShadow).toBe(false);
    expect(props.renderOrder).toBe(42);
    expect(props.matrix).toBe(mesh.matrix);
    expect(props.matrixAutoUpdate).toBe(mesh.matrixAutoUpdate);
    expect(props.matrixWorld).toBe(mesh.matrixWorld);
    expect(props.matrixWorldAutoUpdate).toBe(mesh.matrixWorldAutoUpdate);
    expect(props.matrixWorldNeedsUpdate).toBe(mesh.matrixWorldNeedsUpdate);
    expect(props.up).toBe(mesh.up);
    expect(props.uuid).toBe(mesh.uuid);
    expect(props.userData).toBe(mesh.userData);
  });
});
