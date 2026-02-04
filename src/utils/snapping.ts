import * as THREE from 'three';
import { getModuleDimensions } from './dimensions';

interface Module {
    id: string;
    position: [number, number, number];
    rotation: [number, number, number];
}

const SNAP_THRESHOLD = 0.5; // Distance to trigger snap
const GAP = 0.01; // 1cm gap

interface Module {
    id: string;
    position: [number, number, number];
    rotation: [number, number, number];
    variant: string; // Added variant
}

export const findSnapPosition = (
    proposedPos: THREE.Vector3,
    modules: Module[],
    proposedVariant: string,
    ignoreId?: string
): { position: [number, number, number]; rotation: [number, number, number] } | null => {

    const proposedDim = getModuleDimensions(proposedVariant);

    for (const module of modules) {
        if (module.id === ignoreId) continue;

        const modPos = new THREE.Vector3(...module.position);
        const neighborDim = getModuleDimensions(module.variant);

        // Calculate offset: (NeighborWidth/2 + ProposedWidth/2 + GAP)
        const offsetDist = (neighborDim.width / 2) + (proposedDim.width / 2) + GAP;

        // Calculate offsets based on module rotation
        const rotationCurrent = new THREE.Euler(...module.rotation);
        const offsetVector = new THREE.Vector3(offsetDist, 0, 0).applyEuler(rotationCurrent);

        // Check "Right" Side (Relative to module)
        const rightSnap = modPos.clone().add(offsetVector);
        if (proposedPos.distanceTo(rightSnap) < SNAP_THRESHOLD) {
            return {
                position: [rightSnap.x, rightSnap.y, rightSnap.z],
                rotation: module.rotation // Match neighbor rotation
            };
        }

        // Check "Left" Side (Relative to module)
        const leftSnap = modPos.clone().sub(offsetVector);
        if (proposedPos.distanceTo(leftSnap) < SNAP_THRESHOLD) {
            return {
                position: [leftSnap.x, leftSnap.y, leftSnap.z],
                rotation: module.rotation // Match neighbor rotation
            };
        }

        // TODO: Add L-shape / Corner snapping (Side to End) here if requested.
        // Current logic only supports linear sorting (End to End).
    }

    return null;
};
