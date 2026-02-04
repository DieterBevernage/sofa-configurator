import type { BenchProps } from '../types';
import { Cylinder, Sphere } from '@react-three/drei';

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

        </group>
    );
};
