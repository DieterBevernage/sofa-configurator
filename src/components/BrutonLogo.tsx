import { useMemo } from 'react';
import * as THREE from 'three';

const OLIVE_GREEN = '#6D7759';

const createLetterB = () => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.1);
    shape.lineTo(0.1, 0);
    shape.lineTo(0.7, 0);
    shape.lineTo(0.9, 0.2);
    shape.lineTo(0.9, 0.4);
    shape.lineTo(0.8, 0.5);
    shape.lineTo(0.9, 0.6);
    shape.lineTo(0.9, 0.8);
    shape.lineTo(0.7, 1);
    shape.lineTo(0.1, 1);
    shape.lineTo(0, 0.9);
    shape.lineTo(0, 0.1);

    const path1 = new THREE.Path();
    path1.moveTo(0.2, 0.65);
    path1.lineTo(0.7, 0.65);
    path1.lineTo(0.7, 0.85);
    path1.lineTo(0.2, 0.85);
    path1.lineTo(0.2, 0.65);
    shape.holes.push(path1);

    const path2 = new THREE.Path();
    path2.moveTo(0.2, 0.15);
    path2.lineTo(0.7, 0.15);
    path2.lineTo(0.7, 0.35);
    path2.lineTo(0.2, 0.35);
    path2.lineTo(0.2, 0.15);
    shape.holes.push(path2);

    return shape;
};

const createLetterR = () => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.2, 0);
    shape.lineTo(0.2, 0.45);
    shape.lineTo(0.65, 0);
    shape.lineTo(0.9, 0);
    shape.lineTo(0.45, 0.55);
    shape.lineTo(0.8, 0.55);
    shape.lineTo(0.9, 0.65);
    shape.lineTo(0.9, 0.85);
    shape.lineTo(0.75, 1);
    shape.lineTo(0.1, 1);
    shape.lineTo(0, 0.9);
    shape.lineTo(0, 0);

    const hole = new THREE.Path();
    hole.moveTo(0.2, 0.7);
    hole.lineTo(0.7, 0.7);
    hole.lineTo(0.7, 0.85);
    hole.lineTo(0.2, 0.85);
    hole.lineTo(0.2, 0.7);
    shape.holes.push(hole);
    return shape;
};

const createLetterU = () => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 1);
    shape.lineTo(0, 0.2);
    shape.lineTo(0.2, 0);
    shape.lineTo(0.7, 0);
    shape.lineTo(0.9, 0.2);
    shape.lineTo(0.9, 1);
    shape.lineTo(0.7, 1);
    shape.lineTo(0.7, 0.2);
    shape.lineTo(0.2, 0.2);
    shape.lineTo(0.2, 1);
    shape.lineTo(0, 1);
    return shape;
};

const createLetterT = () => {
    const shape = new THREE.Shape();
    // Top bar
    shape.moveTo(0, 0.9);
    shape.lineTo(0.1, 1);
    shape.lineTo(0.8, 1);
    shape.lineTo(0.9, 0.9);
    shape.lineTo(0.9, 0.75);
    shape.lineTo(0.55, 0.75);
    // Vertical stem
    shape.lineTo(0.55, 0);
    shape.lineTo(0.35, 0);
    shape.lineTo(0.35, 0.75);
    // Back to top bar
    shape.lineTo(0, 0.75);
    shape.lineTo(0, 0.9);
    return shape;
};

const createLetterO = () => {
    const shape = new THREE.Shape();
    shape.moveTo(0.2, 0);
    shape.lineTo(0.7, 0);
    shape.lineTo(0.9, 0.2);
    shape.lineTo(0.9, 0.8);
    shape.lineTo(0.7, 1);
    shape.lineTo(0.2, 1);
    shape.lineTo(0, 0.8);
    shape.lineTo(0, 0.2);
    shape.lineTo(0.2, 0);

    const hole = new THREE.Path();
    hole.moveTo(0.2, 0.2);
    hole.lineTo(0.7, 0.2);
    hole.lineTo(0.7, 0.8);
    hole.lineTo(0.2, 0.8);
    hole.lineTo(0.2, 0.2);
    shape.holes.push(hole);
    return shape;
};

const createLetterN = () => {
    const shape = new THREE.Shape();
    // Solid geometric N with chamfers on outer corners
    shape.moveTo(0, 0.1);
    shape.lineTo(0.1, 0); // Chamfer bottom-left
    shape.lineTo(0.25, 0); // Inner edge of left pillar
    shape.lineTo(0.65, 0.6); // Inner diagonal
    shape.lineTo(0.65, 0); // Inner edge of right pillar
    shape.lineTo(0.8, 0);
    shape.lineTo(0.9, 0.1); // Chamfer bottom-right
    shape.lineTo(0.9, 0.9);
    shape.lineTo(0.8, 1); // Chamfer top-right
    shape.lineTo(0.65, 1); // Inner edge of right pillar top
    shape.lineTo(0.25, 0.4); // Inner diagonal return
    shape.lineTo(0.25, 1); // Inner edge of left pillar top
    shape.lineTo(0.1, 1);
    shape.lineTo(0, 0.9); // Chamfer top-left
    shape.lineTo(0, 0.1);
    return shape;
};

export function BrutonLogo(props: any) {
    const extrudeSettings = {
        steps: 1,
        depth: 0.3,
        bevelEnabled: false
    };

    const letters = useMemo(() => [
        createLetterB(),
        createLetterR(),
        createLetterU(),
        createLetterT(),
        createLetterO(),
        createLetterN()
    ], []);

    // Centering logic: calculate total width (approx 1.1 per letter)
    const totalWidth = (6 - 1) * 1.1 + 0.9;
    const horizontalOffset = -totalWidth / 2;

    return (
        <group {...props} pointerEvents="none">
            <group position={[horizontalOffset, 0, 0]}>
                {letters.map((shape, i) => (
                    <mesh key={i} position={[i * 1.1, 0, 0]}>
                        <extrudeGeometry args={[shape, extrudeSettings]} />
                        <meshStandardMaterial color={OLIVE_GREEN} roughness={0.7} metalness={0.2} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}
