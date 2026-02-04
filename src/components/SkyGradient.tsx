import { BackSide } from 'three';

export const SkyGradient = () => {
  return (
    <mesh>
      <sphereGeometry args={[500, 32, 32]} />
      <shaderMaterial
        side={BackSide}
        uniforms={{
          colorTop: { value: new THREE.Color("#507090") }, // Deep Blue-ish (Unity Sky)
          colorBottom: { value: new THREE.Color("#dbe9f4") } // Light Blue Horizon
        }}
        vertexShader={`
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }
        `}
        fragmentShader={`
          uniform vec3 colorTop;
          uniform vec3 colorBottom;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition + vec3(0, 50, 0)).y; // Shift gradient
            gl_FragColor = vec4( mix( colorBottom, colorTop, max( h, 0.0 ) ), 1.0 );
          }
        `}
      />
    </mesh>
  );
};

import * as THREE from 'three';
