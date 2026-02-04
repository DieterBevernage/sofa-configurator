//import { Face } from 'dxf-writer';
import { withBase } from '../utils/assetPaths';

export const GRASS_CONFIG = {
    // Population
    quantity: 1000000,
    radius: 6, // Total radius of the grass area in meters

    // Fade-out
    fadeStartRadius: 3.0, // At which distance (in meters) the grass starts to thin out
    fadeExponent: 1.0, // Higher means sharper fade at edges
    fadeThreshold: 0.01, // Minimum density threshold (0 to 1) even at the very edge.

    // Dimensions (in meters)
    minLength: 0.04, // 4mm
    maxLength: 0.07, // 6mm

    // Widths (in meters)
    baseWidthMin: 0.004, // 3mm
    baseWidthMax: 0.01, // 5mm
    topWidth: 0.001, // 1mm

    // Curvature & Bending
    // The "angle" of the blade. 
    // Higher value means it leans more in that direction.
    bendAngleLeftRight: 0.1,
    bendAngleFrontBack: 0.1,

    // Curvative property: how much the blade curves as it bends
    curvative: 2,

    // Wind Pattern / Direction
    // All grass will lean in this general direction.
    windDirectionDegrees: 45, // 0 is Right, 90 is Front, etc.
    // How much each blade can differ from the wind direction.
    directionVarianceDegrees: 1.0,
    // Intensity of the wind waving (0 = static, 1 = strong)
    windForce: 0.5,

    // NEW: Stable Color Configuration
    // Each instance picks one bottom and one top color using seeded noise
    colors: {
        bottom1: '#123B0A', // Deep dark green
        bottom2: '#1D4D0F', // Forest green
        top1: '#4A7C2C',    // Leaf green
        top2: '#6B8E23',    // Olive/light green
    },

    // Seed for deterministic noise (constant variation)
    seed: 42,

    // Grass Blade Visuals
    roughness: 0.9,
    metalness: 0.1,
    envMapIntensity: 0.5,
    shadowIntensity: 0.6, // Stronger shadows at base

    // Ground Texture settings
    groundTexturePath: withBase('Grass/ground.png'),
    groundTextureScale: 40.0,
    groundColor: '#445533', // Darker base color to prevent washed-out look
    groundRoughness: 1.0,   // Maximum roughness to prevent glare
    groundMetalness: 0.0,
    groundEnvMapIntensity: 0.01, // Almost no environment reflections on ground
    receiveLampLightBlades: false,
    receiveLampLightGround: true,
};
