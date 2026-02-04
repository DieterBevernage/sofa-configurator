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
    sky: {
        dayTop: '#507090',
        dayHorizon: '#dbe9f4',
        dayBottom: '#dbe9f4',
        nightTop: '#2a2d32',
        nightHorizon: '#3a2516',
        nightBottom: '#0d0907',
        horizonHeight: 0.38,
        horizonBlend: 0.12,
    },
    lamp: {
        layer: 1,
        color: '#ffd9a1',
        emissiveColor: '#fff1d4',
        intensityNight: 15.5,
        intensityDay: 0.0,
        turnOnThreshold: 0.24,
        distance: 7,
        decay: 2.3,
        emissiveIntensity: 1.5
    },
    fog: {
        color: '#dbe9f4',
        nightColor: '#1a130f',
        near: 10,
        far: 90
    }
};
