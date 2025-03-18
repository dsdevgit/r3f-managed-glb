import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ManagedGLB } from './ManagedGLB';

vi.mock('@react-three/drei', () => ({
  useGLTF: () => ({
    scene: {
      name: 'test-scene',
      children: [],
      isMesh: false
    },
    animations: []
  }),
  useAnimations: () => ({
    actions: {}
  })
}));

describe('ManagedGLB', () => {
  it('renders without crashing', () => {
    const { container } = render(<ManagedGLB path="/test.glb" />);
    expect(container).toBeDefined();
  });

  // TODO: add test glb file
  it('calls onInit when scene is loaded', () => {
    const onInit = vi.fn();
    render(<ManagedGLB path="/test.glb" onInit={onInit} />);
    expect(onInit).toHaveBeenCalled();
  });
});
