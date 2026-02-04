import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { BackSide } from 'three';
import { useConfiguratorStore } from '../store/useConfiguratorStore';
import { LIGHTING_CONFIG } from '../config/lighting';

export const SkyGradient = () => {
  const sunIntensity = useConfiguratorStore((state) => state.sunIntensity);
  const sunFactor = THREE.MathUtils.clamp(sunIntensity, 0, 1);
  const colorTop = new THREE.Color(LIGHTING_CONFIG.sky.nightTop).lerp(
    new THREE.Color(LIGHTING_CONFIG.sky.dayTop),
    sunFactor
  );
  const colorHorizon = new THREE.Color(LIGHTING_CONFIG.sky.nightHorizon).lerp(
    new THREE.Color(LIGHTING_CONFIG.sky.dayHorizon),
    sunFactor
  );
  const colorBottom = new THREE.Color(LIGHTING_CONFIG.sky.nightBottom).lerp(
    new THREE.Color(LIGHTING_CONFIG.sky.dayBottom),
    sunFactor
  );

  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    colorTop: { value: new THREE.Color() },
    colorHorizon: { value: new THREE.Color() },
    colorBottom: { value: new THREE.Color() },
    horizonHeight: { value: LIGHTING_CONFIG.sky.horizonHeight },
    horizonBlend: { value: LIGHTING_CONFIG.sky.horizonBlend }
  }), []);

  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.colorTop.value.copy(colorTop);
    materialRef.current.uniforms.colorHorizon.value.copy(colorHorizon);
    materialRef.current.uniforms.colorBottom.value.copy(colorBottom);
    materialRef.current.uniforms.horizonHeight.value = LIGHTING_CONFIG.sky.horizonHeight;
    materialRef.current.uniforms.horizonBlend.value = LIGHTING_CONFIG.sky.horizonBlend;
  }, [colorTop, colorHorizon, colorBottom]);

  return (
    <mesh>
      <sphereGeometry args={[500, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        side={BackSide}
        uniforms={uniforms}
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
          uniform vec3 colorHorizon;
          uniform vec3 colorBottom;
          uniform float horizonHeight;
          uniform float horizonBlend;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition + vec3(0, 50, 0)).y;
            float t = clamp((h + 1.0) * 0.5, 0.0, 1.0);
            float horizonMix = smoothstep(horizonHeight - horizonBlend, horizonHeight + horizonBlend, t);
            vec3 col = mix(colorBottom, colorHorizon, horizonMix);
            float topMix = smoothstep(horizonHeight, 1.0, t);
            col = mix(col, colorTop, topMix);
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
};
