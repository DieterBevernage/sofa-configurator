import DxfParser from 'dxf-parser';

interface DxfEntity {
    type: string;
    vertices?: Array<{ x: number; y: number; z?: number }>;
    center?: { x: number; y: number; z?: number };
    radius?: number;
    startAngle?: number;
    endAngle?: number;
    layer?: string;
    color?: number;
}

/**
 * DXF Unit codes from AutoCAD specification
 * $INSUNITS header variable
 */
const DXF_UNITS: Record<number, { name: string; toMeters: number }> = {
    0: { name: 'Unitless', toMeters: 1 },
    1: { name: 'Inches', toMeters: 0.0254 },
    2: { name: 'Feet', toMeters: 0.3048 },
    3: { name: 'Miles', toMeters: 1609.34 },
    4: { name: 'Millimeters', toMeters: 0.001 },
    5: { name: 'Centimeters', toMeters: 0.01 },
    6: { name: 'Meters', toMeters: 1 },
    7: { name: 'Kilometers', toMeters: 1000 },
    8: { name: 'Microinches', toMeters: 0.0000000254 },
    9: { name: 'Mils', toMeters: 0.0000254 },
    10: { name: 'Yards', toMeters: 0.9144 },
    11: { name: 'Angstroms', toMeters: 0.0000000001 },
    12: { name: 'Nanometers', toMeters: 0.000000001 },
    13: { name: 'Microns', toMeters: 0.000001 },
    14: { name: 'Decimeters', toMeters: 0.1 },
};

/**
 * Detect unit from DXF file based on coordinate magnitude
 * Fallback heuristic if $INSUNITS is not set
 */
function detectUnitFromMagnitude(entities: any[]): number {
    if (entities.length === 0) return 1; // Default to meters

    // Calculate average coordinate magnitude
    let sum = 0;
    let count = 0;

    entities.forEach((entity: any) => {
        if (entity.vertices) {
            entity.vertices.forEach((v: any) => {
                sum += Math.abs(v.x) + Math.abs(v.y);
                count += 2;
            });
        }
        if (entity.center) {
            sum += Math.abs(entity.center.x) + Math.abs(entity.center.y);
            count += 2;
        }
    });

    const avgMagnitude = count > 0 ? sum / count : 0;

    // Heuristic: if average coordinate is > 100, likely millimeters
    // if between 10-100, likely centimeters
    // if < 10, likely meters
    if (avgMagnitude > 100) {
        console.log('🔍 Auto-detected unit: Millimeters (based on coordinate magnitude)');
        return 0.001; // mm to meters
    } else if (avgMagnitude > 10) {
        console.log('🔍 Auto-detected unit: Centimeters (based on coordinate magnitude)');
        return 0.01; // cm to meters
    } else {
        console.log('🔍 Auto-detected unit: Meters (based on coordinate magnitude)');
        return 1; // meters
    }
}

export async function parseDxfFile(file: File): Promise<{ entities: DxfEntity[], bounds: any, unit: string, scaleFactor: number }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const dxfString = e.target?.result as string;
                const parser = new DxfParser();
                const dxf = parser.parseSync(dxfString);

                if (!dxf || !dxf.entities) {
                    reject(new Error('Invalid DXF file'));
                    return;
                }

                // Detect unit from header
                let scaleFactor = 1; // Default to meters
                let unitName = 'Meters (assumed)';

                if (dxf.header && dxf.header.$INSUNITS !== undefined) {
                    const unitCode = dxf.header.$INSUNITS;
                    const unitInfo = DXF_UNITS[unitCode];

                    if (unitInfo) {
                        scaleFactor = unitInfo.toMeters;
                        unitName = unitInfo.name;
                        console.log(`📐 DXF Unit detected from header: ${unitName} (code: ${unitCode})`);
                    } else {
                        console.warn(`⚠️ Unknown unit code: ${unitCode}, using magnitude detection`);
                        scaleFactor = detectUnitFromMagnitude(dxf.entities);
                        unitName = scaleFactor === 0.001 ? 'Millimeters (detected)' :
                            scaleFactor === 0.01 ? 'Centimeters (detected)' :
                                'Meters (detected)';
                    }
                } else {
                    // No unit info in header, use heuristic
                    console.warn('⚠️ No $INSUNITS in DXF header, using magnitude detection');
                    scaleFactor = detectUnitFromMagnitude(dxf.entities);
                    unitName = scaleFactor === 0.001 ? 'Millimeters (detected)' :
                        scaleFactor === 0.01 ? 'Centimeters (detected)' :
                            'Meters (detected)';
                }

                const entities: DxfEntity[] = [];

                // Process each entity with scale conversion
                dxf.entities.forEach((entity: any) => {
                    switch (entity.type) {
                        case 'LINE':
                            entities.push({
                                type: 'line',
                                vertices: [
                                    {
                                        x: entity.vertices[0].x * scaleFactor,
                                        y: entity.vertices[0].y * scaleFactor,
                                        z: (entity.vertices[0].z || 0) * scaleFactor
                                    },
                                    {
                                        x: entity.vertices[1].x * scaleFactor,
                                        y: entity.vertices[1].y * scaleFactor,
                                        z: (entity.vertices[1].z || 0) * scaleFactor
                                    }
                                ],
                                layer: entity.layer,
                                color: entity.color
                            });
                            break;

                        case 'LWPOLYLINE':
                        case 'POLYLINE':
                            entities.push({
                                type: 'polyline',
                                vertices: entity.vertices.map((v: any) => ({
                                    x: v.x * scaleFactor,
                                    y: v.y * scaleFactor,
                                    z: (v.z || 0) * scaleFactor
                                })),
                                layer: entity.layer,
                                color: entity.color
                            });
                            break;

                        case 'CIRCLE':
                            entities.push({
                                type: 'circle',
                                center: {
                                    x: entity.center.x * scaleFactor,
                                    y: entity.center.y * scaleFactor,
                                    z: (entity.center.z || 0) * scaleFactor
                                },
                                radius: entity.radius * scaleFactor,
                                layer: entity.layer,
                                color: entity.color
                            });
                            break;

                        case 'ARC':
                            entities.push({
                                type: 'arc',
                                center: {
                                    x: entity.center.x * scaleFactor,
                                    y: entity.center.y * scaleFactor,
                                    z: (entity.center.z || 0) * scaleFactor
                                },
                                radius: entity.radius * scaleFactor,
                                startAngle: entity.startAngle,
                                endAngle: entity.endAngle,
                                layer: entity.layer,
                                color: entity.color
                            });
                            break;
                    }
                });

                console.log(`✅ Parsed ${entities.length} entities from DXF (${unitName}, scale: ${scaleFactor})`);

                resolve({
                    entities,
                    bounds: dxf.header ? dxf.header.$EXTMIN : null,
                    unit: unitName,
                    scaleFactor
                });

            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
