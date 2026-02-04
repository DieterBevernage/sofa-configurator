export const LIGHTING_CONFIG = {
    // Base positional and color data
    // Intensities and shadow enabling are now driven by src/config/quality.ts
    ambient: {
        color: '#ffffff'
    },
    hemisphere: {
        skyColor: '#ffffff',
        groundColor: '#444444'
    },
    directional: {
        position: [10, 12, 8] as [number, number, number],
    },
    fog: {
        color: '#dbe9f4',
        near: 10,
        far: 90
    }
};
