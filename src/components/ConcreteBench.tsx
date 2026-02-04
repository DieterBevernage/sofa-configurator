import { useMemo, useEffect, Suspense } from 'react';
import type { BenchProps, BenchFinish } from '../types';
import { Box, useGLTF, useTexture } from '@react-three/drei';
import { useConfiguratorStore } from '../store/useConfiguratorStore';
import * as THREE from 'three';
import { getProduct } from '../config/products';
import { getFinish } from '../config/finishes';
import { QUALITY_CONFIG } from '../config/quality';

function GenericModel({ path, color, finish, isColliding }: { path: string, color: string, finish: BenchFinish, isColliding?: boolean }) {
    const { scene } = useGLTF(path);
    const triplanarEnabled = useConfiguratorStore(state => state.triplanarEnabled);
    const renderingQuality = useConfiguratorStore(state => state.renderingQuality);
    const quality = QUALITY_CONFIG[renderingQuality];

    const finishConfig = getFinish(finish) || getFinish('glad');
    const hasBump = quality.materials.useFinishBump;
    const bumpRate = quality.materials.finishBumpMultiplier;

    const bumpMap = useTexture(finishConfig?.bumpMapPath || '/Finishes/glad_bump.png');

    // Setup texture
    useEffect(() => {
        if (bumpMap) {
            bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
            if (!triplanarEnabled) {
                // Standard scaling only if NOT using triplanar
                const tilesPerMeter = 1 / (finishConfig.tileSizeMeters || 0.15);
                bumpMap.repeat.set(tilesPerMeter, tilesPerMeter);
            } else {
                // For triplanar, we use 1:1 repeat and handle scaling in shader
                bumpMap.repeat.set(1, 1);
            }
            bumpMap.needsUpdate = true;
        }
    }, [bumpMap, finishConfig.tileSizeMeters, triplanarEnabled]);

    const clonedScene = useMemo(() => {
        const s = scene.clone();
        s.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const m = child as THREE.Mesh;
                m.castShadow = true;
                m.receiveShadow = true;
            }
        });
        return s;
    }, [scene]);

    const tintColor = isColliding ? '#ef4444' : getColorHex(color);

    useEffect(() => {
        clonedScene.traverse((child: any) => {
            if (child.isMesh) {
                const mat = new THREE.MeshStandardMaterial({
                    color: tintColor,
                    map: (triplanarEnabled || !hasBump) ? null : bumpMap,
                    roughness: finishConfig.roughness,
                    metalness: 0.1,
                    envMapIntensity: finishConfig.envMapIntensity,
                    bumpMap: (triplanarEnabled || !hasBump) ? null : bumpMap,
                    bumpScale: finishConfig.bumpIntensity * bumpRate
                });

                if (triplanarEnabled) {
                    mat.onBeforeCompile = (shader) => {
                        shader.uniforms.uTileSize = { value: 1 / finishConfig.tileSizeMeters };
                        shader.uniforms.uDiffuse = { value: bumpMap };
                        shader.uniforms.uBumpScale = { value: finishConfig.bumpIntensity * bumpRate };

                        shader.vertexShader = `
                            varying vec3 vWorldPos;
                            varying vec3 vWorldNormal;
                            ${shader.vertexShader.replace(
                            '#include <worldpos_vertex>',
                            `
                                #include <worldpos_vertex>
                                vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
                                vWorldNormal = normalize( (modelMatrix * vec4(normal, 0.0)).xyz );
                                `
                        )}
                        `;

                        shader.fragmentShader = `
                            varying vec3 vWorldPos;
                            varying vec3 vWorldNormal;
                            uniform float uTileSize;
                            uniform sampler2D uDiffuse;
                            uniform float uBumpScale;
                            ${shader.fragmentShader.replace(
                            '#include <map_fragment>',
                            `
                                vec3 blending = abs(vWorldNormal);
                                blending /= (blending.x + blending.y + blending.z);
                                vec3 x = texture2D(uDiffuse, vWorldPos.yz * uTileSize).rgb;
                                vec3 y = texture2D(uDiffuse, vWorldPos.xz * uTileSize).rgb;
                                vec3 z = texture2D(uDiffuse, vWorldPos.xy * uTileSize).rgb;
                                diffuseColor.rgb *= (x * blending.x + y * blending.y + z * blending.z);
                                `
                        )}
                        `;
                    };
                }

                child.material = mat;
            }
        });
    }, [clonedScene, tintColor, bumpMap, finishConfig, triplanarEnabled]);

    return <primitive object={clonedScene} />;
}

export const ConcreteBench = ({
    id,
    position,
    rotation = [0, 0, 0],
    variant = 'standard',
    finish = 'glad',
    onSelect,
    selected,
    onRotate,
    ...props
}: BenchProps & {
    onPointerDown?: (e: any) => void;
    pointerEvents?: string;
    onRotate?: (angle: number) => void;
}) => {
    const setIsRotating = useConfiguratorStore((state) => state.setIsRotating);
    const isRotating = useConfiguratorStore((state) => state.isRotating);
    const draggingId = useConfiguratorStore((state) => state.draggingId);

    const color = props.color || 'Grijs';
    const isColliding = props.isColliding;

    // Get Product Config
    const product = getProduct(variant);
    const width = product?.width ?? 1.5;
    const height = product?.height ?? 0.45;
    const depth = product?.depth ?? 0.5;

    // Load Finish Texture
    const triplanarEnabled = useConfiguratorStore(state => state.triplanarEnabled);
    const renderingQuality = useConfiguratorStore(state => state.renderingQuality);
    const quality = QUALITY_CONFIG[renderingQuality];

    const finishConfig = getFinish(finish) || getFinish('glad');
    const hasBump = quality.materials.useFinishBump;
    const bumpRate = quality.materials.finishBumpMultiplier;

    const bumpMap = useTexture(finishConfig.bumpMapPath);

    useEffect(() => {
        if (bumpMap) {
            bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
            if (!triplanarEnabled) {
                const tilesPerMeter = 1 / (finishConfig.tileSizeMeters || 0.15);
                bumpMap.repeat.set(width * tilesPerMeter, depth * tilesPerMeter);
            } else {
                bumpMap.repeat.set(1, 1);
            }
            bumpMap.needsUpdate = true;
        }
    }, [bumpMap, width, depth, finishConfig.tileSizeMeters, triplanarEnabled]);

    const concreteMaterial = useMemo(() => {
        const mat = new THREE.MeshStandardMaterial({
            color: isColliding ? "#ef4444" : getColorHex(color),
            map: (triplanarEnabled || !hasBump) ? null : bumpMap,
            roughness: finishConfig.roughness,
            metalness: 0.1,
            envMapIntensity: finishConfig.envMapIntensity,
            bumpMap: (triplanarEnabled || !hasBump) ? null : bumpMap,
            bumpScale: finishConfig.bumpIntensity * bumpRate,
        });

        if (triplanarEnabled) {
            mat.onBeforeCompile = (shader) => {
                shader.uniforms.uTileSize = { value: 1 / finishConfig.tileSizeMeters };
                shader.uniforms.uDiffuse = { value: bumpMap };

                shader.vertexShader = `
                    varying vec3 vWorldPos;
                    varying vec3 vWorldNormal;
                    ${shader.vertexShader.replace(
                    '#include <worldpos_vertex>',
                    `
                        #include <worldpos_vertex>
                        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
                        vWorldNormal = normalize( (modelMatrix * vec4(normal, 0.0)).xyz );
                        `
                )}
                `;

                shader.fragmentShader = `
                    varying vec3 vWorldPos;
                    varying vec3 vWorldNormal;
                    uniform float uTileSize;
                    uniform sampler2D uDiffuse;
                    ${shader.fragmentShader.replace(
                    '#include <map_fragment>',
                    `
                        vec3 blending = abs(vWorldNormal);
                        blending /= (blending.x + blending.y + blending.z);
                        vec3 x = texture2D(uDiffuse, vWorldPos.yz * uTileSize).rgb;
                        vec3 y = texture2D(uDiffuse, vWorldPos.xz * uTileSize).rgb;
                        vec3 z = texture2D(uDiffuse, vWorldPos.xy * uTileSize).rgb;
                        diffuseColor.rgb *= (x * blending.x + y * blending.y + z * blending.z);
                        `
                )}
                `;
            };
        }

        return mat;
    }, [isColliding, color, bumpMap, finishConfig, triplanarEnabled]);

    const woodMaterial = useMemo(() => (
        <meshStandardMaterial
            color="#8b5a2b"
            roughness={0.9}
        />
    ), []);

    const solarMaterial = useMemo(() => (
        <meshStandardMaterial
            color="#1a1a2e"
            roughness={0.2}
            metalness={0.8}
        />
    ), []);

    const handleRotationDrag = (e: any) => {
        e.stopPropagation();
        if (!onRotate) return;
        const relativeX = e.point.x - position[0];
        const relativeZ = e.point.z - position[2];
        const angle = Math.atan2(relativeX, relativeZ);
        onRotate(angle);
    };

    return (
        <group
            position={position}
            rotation={rotation}
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.(id);
            }}
            {...props}
        >
            {/* Rotation Handle */}
            {selected && !draggingId && (
                <group>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                        <ringGeometry args={[0.8, 1.0, 64]} />
                        <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} transparent opacity={0.8} />
                    </mesh>
                    <mesh
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, 0.05, 0]}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            setIsRotating(true);
                            (e.target as Element).setPointerCapture(e.pointerId);
                        }}
                        onPointerUp={(e) => {
                            e.stopPropagation();
                            setIsRotating(false);
                            (e.target as Element).releasePointerCapture(e.pointerId);
                        }}
                        onPointerMove={(e) => {
                            if (isRotating) {
                                handleRotationDrag(e);
                            }
                        }}
                    >
                        <torusGeometry args={[0.9, 0.2, 16, 64]} />
                        <meshBasicMaterial visible={false} />
                    </mesh>
                </group>
            )}

            {/* Selection Highlight */}
            {selected && (
                <mesh position={[0, height / 2, 0]}>
                    <boxGeometry args={[width + 0.05, height + 0.05, depth + 0.05]} />
                    <meshBasicMaterial color="#ffff00" wireframe />
                </mesh>
            )}

            {/* Main Base */}
            {product?.type === 'concrete' && (
                <Box
                    args={[width, height, depth]}
                    position={[0, height / 2, 0]}
                    castShadow
                    receiveShadow
                    material={concreteMaterial}
                />
            )}

            {/* GLB Models */}
            {product?.type === 'glb' && product.modelPath && (
                <group position={[0, 0, 0]}>
                    <Suspense fallback={null}>
                        <GenericModel path={product.modelPath} color={color} finish={finish} isColliding={isColliding} />
                    </Suspense>
                </group>
            )}

            {/* Variant: Backrest */}
            {variant === 'backrest' && (
                <group position={[0, height + 0.4, -depth / 2 + 0.05]}>
                    <Box args={[0.1, 0.4, 0.05]} position={[-0.6, -0.2, 0]}>
                        {woodMaterial}
                    </Box>
                    <Box args={[0.1, 0.4, 0.05]} position={[0.6, -0.2, 0]}>
                        {woodMaterial}
                    </Box>
                    <Box args={[width, 0.25, 0.05]} position={[0, 0.1, 0]}>
                        {woodMaterial}
                    </Box>
                </group>
            )}

            {/* Variant: Planter */}
            {variant === 'planter' && (
                <group position={[width / 2 - 0.25, height, 0]}>
                    <Box args={[0.4, 0.2, 0.4]} position={[0, 0.1, 0]}>
                        <meshStandardMaterial color="#5d4037" />
                    </Box>
                    <Box args={[0.2, 0.4, 0.2]} position={[0, 0.4, 0]}>
                        <meshStandardMaterial color="#4caf50" />
                    </Box>
                </group>
            )}

            {/* Variant: Solar */}
            {variant === 'solar' && (
                <group position={[0, height, 0]}>
                    <Box args={[width - 0.2, 0.02, depth - 0.1]} position={[0, 0.01, 0]}>
                        {solarMaterial}
                    </Box>
                </group>
            )}
        </group>
    );
};

function getColorHex(name: string) {
    switch (name) {
        case 'Groen': return '#4ade80';
        case 'Rood': return '#f87171';
        case 'Grijs': return '#6b7280';
        case 'Zwart': return '#1f2937';
        case 'Wit': return '#ffffff';
        case 'Lichtgrijs': return '#e5e7eb';
        case 'Beige': return '#d6cba0';
        default: return '#cccccc';
    }
}
