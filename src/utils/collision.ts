import * as THREE from 'three';
import type { Module, BenchVariant } from '../types';
import { getModuleDimensions } from './dimensions';

export const checkCollision = (
    targetPos: THREE.Vector3,
    targetRot: THREE.Euler,
    targetId: string | null,
    modules: Module[],
    targetVariant: BenchVariant | string = 'standard' // Default if unknown
): boolean => {
    // Simple radius-based or AABB check first?
    // User requested "cannot place in each other".
    // Modules are roughly 1.5m x 0.5m.
    // Let's use simple distance check for now, or OBB if we want precision.
    // Given the deadline/complexity, let's start with a bounding box check that assumes strict sizes.
    // Standard bench: 1.5 x 0.5.

    // Let's us simple Rectangle Intersection logic in 2D (ignoring Y).

    // Get dimensions for target
    const targetDim = getModuleDimensions(targetVariant);
    const targetCorners = getCorners(targetPos, targetRot.y, targetDim.width, targetDim.depth);

    // Function to checking polygon intersection (Separating Axis Theorem - simplified for rectangles?)
    // Or just simple "Point in Polygon" check?
    // SAT is robust.

    // For this context, let's stick to a simpler "Minimum Separation" check.
    // If aligned?

    // Let's try SAT.

    for (const m of modules) {
        if (m.id === targetId) continue;

        const mPos = new THREE.Vector3(...m.position);

        // Quick broadphase (use max dimension)
        if (mPos.distanceTo(targetPos) > 2.5) continue;

        const mDim = getModuleDimensions(m.variant);
        const mCorners = getCorners(mPos, m.rotation[1], mDim.width, mDim.depth);

        if (polygonsIntersect(targetCorners, mCorners)) return true;
    }

    return false;
};

const getCorners = (pos: THREE.Vector3, rotY: number, width: number, depth: number) => {
    const c = Math.cos(rotY);
    const s = Math.sin(rotY);
    const halfW = width / 2 - 0.02; // Small tolerance
    const halfD = depth / 2 - 0.02;

    // 4 corners relative to center
    // (+W, +D), (+W, -D), (-W, -D), (-W, +D)
    const corners = [
        { x: halfW, z: halfD },
        { x: halfW, z: -halfD },
        { x: -halfW, z: -halfD },
        { x: -halfW, z: halfD }
    ];

    return corners.map(p => ({
        x: pos.x + (p.x * c - p.z * s),
        z: pos.z + (p.x * s + p.z * c)
    }));
};

// SAT Helper: Do polygons A and B intersect?
function polygonsIntersect(a: { x: number, z: number }[], b: { x: number, z: number }[]) {
    const polygons = [a, b];
    let minA, maxA, projected, i, i1, j, minB, maxB;

    for (i = 0; i < polygons.length; i++) {
        const polygon = polygons[i];
        for (i1 = 0; i1 < polygon.length; i1++) {
            const i2 = (i1 + 1) % polygon.length;
            const p1 = polygon[i1];
            const p2 = polygon[i2];

            const normal = { x: p2.z - p1.z, z: p1.x - p2.x };

            minA = maxA = undefined;
            for (j = 0; j < a.length; j++) {
                projected = normal.x * a[j].x + normal.z * a[j].z;
                if (minA === undefined || projected < minA) minA = projected;
                if (maxA === undefined || projected > maxA) maxA = projected;
            }

            minB = maxB = undefined;
            for (j = 0; j < b.length; j++) {
                projected = normal.x * b[j].x + normal.z * b[j].z;
                if (minB === undefined || projected < minB) minB = projected;
                if (maxB === undefined || projected > maxB) maxB = projected;
            }

            if (maxA! < minB! || maxB! < minA!) return false;
        }
    }
    return true;
}
