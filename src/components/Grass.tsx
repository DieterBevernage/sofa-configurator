import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useConfiguratorStore } from '../store/useConfiguratorStore';
import { GRASS_CONFIG } from '../config/grass';
import { QUALITY_CONFIG } from '../config/quality';
const vertexShaderHooks = `
  varying vec2 vGrassUv;
  varying vec3 vGrassColor;
  uniform float uTime;
  uniform float uCurvative;
  uniform float uWindForce;
  uniform float uSeed;
  uniform vec3 uBottomColor1;
  uniform vec3 uBottomColor2;
  uniform vec3 uTopColor1;
  uniform vec3 uTopColor2;
  attribute vec2 aBend;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }
`;

const vertexShaderLogic = `
    vGrassUv = uv;
    float instanceSeed = hash(float(gl_InstanceID) + uSeed);
    float bottomSelect = hash(instanceSeed + 1.0);
    float topSelect = hash(instanceSeed + 2.0);
    vec3 bColor = (bottomSelect > 0.5) ? uBottomColor1 : uBottomColor2;
    vec3 tColor = (topSelect > 0.5) ? uTopColor1 : uTopColor2;
    vGrassColor = mix(bColor, tColor, uv.y);

    float windX = sin(uTime * 1.2 + instanceMatrix[3].x * 0.5 + instanceMatrix[3].z * 0.5) * 0.08 * uWindForce;
    float windZ = cos(uTime * 1.5 + instanceMatrix[3].x * 3.0 + instanceMatrix[3].z * 1.5) * 0.04 * uWindForce;
    float bendX = (aBend.x + windX) * pow(uv.y, uCurvative);
    float bendZ = (aBend.y + windZ) * pow(uv.y, uCurvative);

    transformed.x += bendX;
    transformed.z += bendZ;
`;

const fragmentShaderHooks = `
  varying vec2 vGrassUv;
  varying vec3 vGrassColor;
  uniform float uShadowIntensity;
`;

const fragmentShaderLogic = `
    vec3 grassBaseColor = vGrassColor;
    float shadow = mix(1.0 - uShadowIntensity, 1.0, vGrassUv.y);
    grassBaseColor *= shadow;
    grassBaseColor += pow(vGrassUv.y, 5.0) * 0.1; // Tip highlight
    
    float width = 1.0 - vGrassUv.y * 0.75;
    float alphaMask = 1.0 - smoothstep(0.0, 0.1, (abs(vGrassUv.x - 0.5) * 2.0) - width);
    if (alphaMask < 0.5) discard;

    diffuseColor.rgb *= grassBaseColor;
`;

const groundFragmentHooks = `
  varying vec2 vGroundUv;
  varying vec3 vGroundWorldPos;
  uniform float uRadius;
  uniform float uFadeStart;
  uniform float uFadeExponent;
  uniform float uFadeThreshold;
`;

const groundFragmentLogic = `
    float dist = length(vGroundWorldPos.xz);
    float alpha = 1.0;
    if (dist > uFadeStart) {
        float fadeRange = uRadius - uFadeStart;
        float factor = pow((dist - uFadeStart) / fadeRange, uFadeExponent);
        alpha = 1.0 - factor * (1.0 - uFadeThreshold);
    }
    if (dist > uRadius) alpha = 0.0;
    
    diffuseColor.a *= alpha;
`;

export function Grass({ radius = GRASS_CONFIG.radius }) {
    const renderingQuality = useConfiguratorStore(state => state.renderingQuality);
    const quality = QUALITY_CONFIG[renderingQuality];
    const quantity = Math.floor(GRASS_CONFIG.quantity * quality.grass.densityFactor);

    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groundRef = useRef<THREE.Mesh>(null);
    const groundTexture = useTexture(GRASS_CONFIG.groundTexturePath);
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;

    const grassMaterial = useMemo(() => {
        const material = quality.grass.usePBR
            ? new THREE.MeshStandardMaterial({
                side: THREE.DoubleSide,
                roughness: GRASS_CONFIG.roughness,
                metalness: GRASS_CONFIG.metalness,
                envMapIntensity: GRASS_CONFIG.envMapIntensity,
            })
            : new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });

        material.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = { value: 0 };
            shader.uniforms.uCurvative = { value: GRASS_CONFIG.curvative };
            shader.uniforms.uWindForce = { value: GRASS_CONFIG.windForce };
            shader.uniforms.uSeed = { value: GRASS_CONFIG.seed };
            shader.uniforms.uBottomColor1 = { value: new THREE.Color(GRASS_CONFIG.colors.bottom1) };
            shader.uniforms.uBottomColor2 = { value: new THREE.Color(GRASS_CONFIG.colors.bottom2) };
            shader.uniforms.uTopColor1 = { value: new THREE.Color(GRASS_CONFIG.colors.top1) };
            shader.uniforms.uTopColor2 = { value: new THREE.Color(GRASS_CONFIG.colors.top2) };
            shader.uniforms.uShadowIntensity = { value: GRASS_CONFIG.shadowIntensity };

            shader.vertexShader = vertexShaderHooks + shader.vertexShader.replace(
                '#include <begin_vertex>',
                `#include <begin_vertex>\n${vertexShaderLogic} `
            );

            shader.fragmentShader = fragmentShaderHooks + shader.fragmentShader.replace(
                '#include <map_fragment>',
                `#include <map_fragment>\n${fragmentShaderLogic} `
            );

            (material as any).userData.shader = shader;
        };

        return material;
    }, [renderingQuality]); // Re-create on quality change

    const groundMaterial = useMemo(() => {
        const mat = new THREE.MeshStandardMaterial({
            map: groundTexture,
            color: new THREE.Color(GRASS_CONFIG.groundColor), // Match dark base
            transparent: true,
            roughness: GRASS_CONFIG.groundRoughness,
            metalness: GRASS_CONFIG.groundMetalness,
            envMapIntensity: GRASS_CONFIG.groundEnvMapIntensity,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1,
            depthWrite: true,
        });

        // Tiling via repeat
        groundTexture.repeat.set(GRASS_CONFIG.groundTextureScale, GRASS_CONFIG.groundTextureScale);

        mat.onBeforeCompile = (shader) => {
            shader.uniforms.uRadius = { value: GRASS_CONFIG.radius };
            shader.uniforms.uFadeStart = { value: GRASS_CONFIG.fadeStartRadius };
            shader.uniforms.uFadeExponent = { value: GRASS_CONFIG.fadeExponent };
            shader.uniforms.uFadeThreshold = { value: GRASS_CONFIG.fadeThreshold };

            shader.vertexShader = shader.vertexShader.replace(
                'varying vec3 vViewPosition;',
                'varying vec3 vViewPosition;\nvarying vec3 vGroundWorldPos;\nvarying vec2 vGroundUv;'
            ).replace(
                '#include <worldpos_vertex>',
                '#include <worldpos_vertex>\nvGroundWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvGroundUv = uv;'
            );

            shader.fragmentShader = groundFragmentHooks + shader.fragmentShader.replace(
                '#include <alphamap_fragment>',
                `#include <alphamap_fragment>\n${groundFragmentLogic} `
            );
        };

        return mat;
    }, [groundTexture, renderingQuality]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    const { bends, positions } = useMemo(() => {
        const bendArr = new Float32Array(quantity * 2);
        const posData = [];

        const windRad = (GRASS_CONFIG.windDirectionDegrees * Math.PI) / 180;
        const varianceRad = (GRASS_CONFIG.directionVarianceDegrees * Math.PI) / 180;

        let placed = 0;
        let attempts = 0;
        const maxAttempts = quantity * 10;

        while (placed < quantity && attempts < maxAttempts) {
            attempts++;
            const r = Math.sqrt(Math.random()) * radius;

            let prob = 1.0;
            if (r > GRASS_CONFIG.fadeStartRadius) {
                const distPastStart = r - GRASS_CONFIG.fadeStartRadius;
                const fadeRange = radius - GRASS_CONFIG.fadeStartRadius;
                const fadeFactor = Math.pow(distPastStart / fadeRange, GRASS_CONFIG.fadeExponent);
                prob = 1.0 - fadeFactor * (1.0 - GRASS_CONFIG.fadeThreshold);
            }

            if (Math.random() > prob) continue;

            const theta = Math.random() * 2 * Math.PI;
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);

            const length = GRASS_CONFIG.minLength + Math.random() * (GRASS_CONFIG.maxLength - GRASS_CONFIG.minLength);
            const baseW = GRASS_CONFIG.baseWidthMin + Math.random() * (GRASS_CONFIG.baseWidthMax - GRASS_CONFIG.baseWidthMin);

            const rotation = windRad + (Math.random() - 0.5) * varianceRad * 2;

            bendArr[placed * 2 + 0] = (Math.random() - 0.5) * GRASS_CONFIG.bendAngleLeftRight;
            bendArr[placed * 2 + 1] = (Math.random() - 0.5) * GRASS_CONFIG.bendAngleFrontBack;

            posData.push({ x, z, length, baseW, rot: rotation });
            placed++;
        }

        return {
            bends: bendArr.slice(0, placed * 2),
            positions: posData
        };
    }, [quantity, radius]);

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as any;
            const shader = material.userData.shader;
            if (shader) {
                shader.uniforms.uTime.value = state.clock.elapsedTime;
                shader.uniforms.uWindForce.value = GRASS_CONFIG.windForce;
                shader.uniforms.uCurvative.value = GRASS_CONFIG.curvative;
            }
        }
    });

    useMemo(() => {
        setTimeout(() => {
            if (meshRef.current) {
                positions.forEach((p, i) => {
                    dummy.position.set(p.x, 0, p.z);
                    dummy.rotation.y = p.rot;
                    dummy.scale.set(p.baseW, p.length, 1);
                    dummy.updateMatrix();
                    meshRef.current!.setMatrixAt(i, dummy.matrix);
                });
                meshRef.current.instanceMatrix.needsUpdate = true;
            }
        }, 0);
    }, [positions, dummy]);

    return (
        <group>
            {/* Ground Texture Plane */}
            <mesh
                ref={groundRef}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.001, 0]}
                receiveShadow
                material={groundMaterial}
            >
                <circleGeometry args={[radius, 32]} />
            </mesh>

            {/* Instanced Grass */}
            <instancedMesh
                ref={meshRef}
                args={[null as any, null as any, positions.length]}
                position={[0, 0.002, 0]}
                castShadow={quality.grass.castShadows}
                receiveShadow={quality.grass.receiveShadows}
                frustumCulled={false}
            >
                <planeGeometry args={[1, 1, 1, 5]}>
                    <instancedBufferAttribute attach="attributes-aBend" args={[bends, 2]} />
                </planeGeometry>
                <primitive object={grassMaterial} attach="material" />
            </instancedMesh>
        </group>
    );
}
