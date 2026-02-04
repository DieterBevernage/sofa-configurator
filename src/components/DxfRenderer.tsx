import { useSceneStore } from '../store/useSceneStore';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

const OLIVE_GREEN = '#6D7759';
const DXF_HEIGHT = 0.005; // 0.5cm above ground

export function DxfRenderer() {
    const importedDxfData = useSceneStore((state) => state.importedDxfData);
    const manualScale = useSceneStore((state) => state.manualScale);

    if (!importedDxfData || importedDxfData.length === 0) {
        return null;
    }

    return (
        <group position={[0, DXF_HEIGHT, 0]} scale={[manualScale, manualScale, manualScale]}>
            {importedDxfData.map((entity, index) => {
                switch (entity.type) {
                    case 'line':
                        if (entity.vertices && entity.vertices.length === 2) {
                            const points = [
                                new THREE.Vector3(entity.vertices[0].x, entity.vertices[0].z || 0, -entity.vertices[0].y),
                                new THREE.Vector3(entity.vertices[1].x, entity.vertices[1].z || 0, -entity.vertices[1].y)
                            ];
                            return (
                                <Line
                                    key={`line-${index}`}
                                    points={points}
                                    color={OLIVE_GREEN}
                                    lineWidth={2}
                                />
                            );
                        }
                        break;

                    case 'polyline':
                        if (entity.vertices && entity.vertices.length > 1) {
                            const points = entity.vertices.map(v =>
                                new THREE.Vector3(v.x, v.z || 0, -v.y)
                            );
                            return (
                                <Line
                                    key={`polyline-${index}`}
                                    points={points}
                                    color={OLIVE_GREEN}
                                    lineWidth={2}
                                />
                            );
                        }
                        break;

                    case 'circle':
                        if (entity.center && entity.radius) {
                            const curve = new THREE.EllipseCurve(
                                0, 0,
                                entity.radius, entity.radius,
                                0, 2 * Math.PI,
                                false,
                                0
                            );
                            const points = curve.getPoints(50).map(p =>
                                new THREE.Vector3(p.x, 0, p.y)
                            );
                            return (
                                <Line
                                    key={`circle-${index}`}
                                    points={points}
                                    color={OLIVE_GREEN}
                                    lineWidth={2}
                                    position={[entity.center.x, entity.center.z || 0, -entity.center.y]}
                                />
                            );
                        }
                        break;

                    case 'arc':
                        if (entity.center && entity.radius && entity.startAngle !== undefined && entity.endAngle !== undefined) {
                            const curve = new THREE.EllipseCurve(
                                0, 0,
                                entity.radius, entity.radius,
                                entity.startAngle, entity.endAngle,
                                false,
                                0
                            );
                            const points = curve.getPoints(50).map(p =>
                                new THREE.Vector3(p.x, 0, p.y)
                            );
                            return (
                                <Line
                                    key={`arc-${index}`}
                                    points={points}
                                    color={OLIVE_GREEN}
                                    lineWidth={2}
                                    position={[entity.center.x, entity.center.z || 0, -entity.center.y]}
                                />
                            );
                        }
                        break;
                }
                return null;
            })}
        </group>
    );
}
