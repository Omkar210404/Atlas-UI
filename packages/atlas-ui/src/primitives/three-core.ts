/**
 * The parts of three.js that atlas-ui's 3D components use, re-exported by name. Importing
 * named exports (instead of `import('three/webgpu')` as a namespace) lets the bundler drop
 * the rest of the library from the lazy chunk.
 */
export {
  CircleGeometry,
  Color,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshBasicNodeMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector2,
  WebGPURenderer,
} from 'three/webgpu';
export {
  abs,
  float,
  fract,
  fwidth,
  mix,
  mx_noise_float,
  smoothstep,
  uniform,
  uv,
  vec2,
  vec3,
} from 'three/tsl';
