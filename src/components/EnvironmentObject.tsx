import { useEffect, useRef } from 'react';
import type { BenchProps } from '../types';
import { Cylinder, Sphere } from '@react-three/drei';
import { useConfiguratorStore } from '../store/useConfiguratorStore';
import * as THREE from 'three';
import { LIGHTING_CONFIG } from '../config/lighting';

export const EnvironmentObject = ({
    id,
    position,
    rotation,
    variant,
    selected,
    onSelect,
    ...props
}: BenchProps) => {

    const treeColors = { trunk: '#5d4037', leaves: '#2e7d32' };
    const humanColor = '#e0e0e0'; // Abstract mannequin
    const groupRef = useRef<THREE.Group>(null);
    const lampLightRef = useRef<THREE.PointLight>(null);
    const sunIntensity = useConfiguratorStore((state) => state.sunIntensity);
    const lampOn = sunIntensity <= LIGHTING_CONFIG.lamp.turnOnThreshold;
    const lampLightIntensity = lampOn ? LIGHTING_CONFIG.lamp.intensityNight : 0;
    const lampGlowColor = new THREE.Color(LIGHTING_CONFIG.lamp.color).lerp(
        new THREE.Color('#fff4d6'),
        sunIntensity
    );

    useEffect(() => {
        const lampLayer = LIGHTING_CONFIG.lamp.layer;
        if (groupRef.current) {
            groupRef.current.traverse((child) => {
                child.layers.enable(lampLayer);
            });
        }
        if (lampLightRef.current) {
            lampLightRef.current.layers.set(lampLayer);
        }
    }, []);

    return (
        <group
            ref={groupRef}
            position={position}
            rotation={rotation}
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.(id);
            }}
            {...props}
        >
            {/* Selection Highlight */}
            {selected && (
                <mesh position={[0, 1, 0]}>
                    <cylinderGeometry args={[0.6, 0.6, 2.2, 32]} />
                    <meshBasicMaterial color="#ffff00" wireframe />
                </mesh>
            )}

            {variant === 'tree' && (
                <group>
                    {/* Trunk */}
                    <Cylinder args={[0.2, 0.3, 1, 8]} position={[0, 0.5, 0]} castShadow receiveShadow>
                        <meshStandardMaterial color={treeColors.trunk} />
                    </Cylinder>
                    {/* Leaves (Low Poly Cones) */}
                    <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
                        <coneGeometry args={[0.8, 1.5, 8]} />
                        <meshStandardMaterial color={treeColors.leaves} flatShading />
                    </mesh>
                    <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
                        <coneGeometry args={[0.6, 1.2, 8]} />
                        <meshStandardMaterial color={treeColors.leaves} flatShading />
                    </mesh>
                </group>
            )}

            {variant === 'human' && (
                <group position={[0, 0.9, 0]}>
                    {/* Simple abstract human figure (Mannequin) */}
                    <Cylinder args={[0.15, 0.15, 0.8, 16]} position={[0, 0, 0]} castShadow>
                        <meshStandardMaterial color={humanColor} />
                    </Cylinder>
                    <Sphere args={[0.2, 16, 16]} position={[0, 0.55, 0]} castShadow>
                        <meshStandardMaterial color={humanColor} />
                    </Sphere>
                    {/* Legs area */}
                    <Cylinder args={[0.15, 0.2, 0.9, 16]} position={[0, -0.85, 0]} castShadow>
                        <meshStandardMaterial color="#424242" />
                    </Cylinder>
                </group>
            )}

            {variant === 'lamp' && (
                <group position={[0, 0, 0]}>
                    <Cylinder args={[0.18, 0.22, 0.25, 16]} position={[0, 0.125, 0]} castShadow receiveShadow>
                        <meshStandardMaterial color="#2b2f36" metalness={0.6} roughness={0.4} />
                    </Cylinder>
                    <Cylinder args={[0.06, 0.08, 2.6, 12]} position={[0, 1.55, 0]} castShadow receiveShadow>
                        <meshStandardMaterial color="#3a3f46" metalness={0.7} roughness={0.35} />
                    </Cylinder>
                    <mesh position={[0, 2.9, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.28, 0.18, 0.28]} />
                        <meshStandardMaterial color="#1f2328" metalness={0.5} roughness={0.4} />
                    </mesh>
                    <Sphere args={[0.12, 16, 16]} position={[0, 2.85, 0]}>
                        <meshStandardMaterial
                            color={LIGHTING_CONFIG.lamp.emissiveColor}
                            emissive={lampGlowColor}
                            emissiveIntensity={lampOn ? LIGHTING_CONFIG.lamp.emissiveIntensity : 0}
                        />
                    </Sphere>
                    <pointLight
                        ref={lampLightRef}
                        position={[0, 2.85, 0]}
                        intensity={lampLightIntensity}
                        distance={LIGHTING_CONFIG.lamp.distance}
                        decay={LIGHTING_CONFIG.lamp.decay}
                        color={lampGlowColor}
                        castShadow
                    />
                </group>
            )}

        </group>
    );
};
