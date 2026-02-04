export const CAMERA_CONFIG = {
    // Basic Camera Settings
    fov: 45,
    defaultPosition: [-7, 3, 10] as [number, number, number],

    // Zoom Limits (Distance from target)
    minDistance: 2,
    maxDistance: 20,

    // Rotation Limits (Vertical/Polar Angle)
    // 0 is looking from directly above.
    // PI / 2 (1.57) is looking exactly from the side (level with ground).
    minPolarAngle: 0,
    // Set this slightly less than PI/2 to prevent looking "into" the ground or too flat.
    maxPolarAngle: 1.4,

    // Panning Limits
    minPanY: 0.1, // Minimum height (Y) for the camera target when panning
};
