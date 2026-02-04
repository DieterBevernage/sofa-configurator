export type QualityTier = 'low' | 'high';

export interface QualityProfile {
    /** Detailed renderer and resolution settings / Instellingen voor de engine en resolutie */
    renderer: {
        /** Minimum Device Pixel Ratio (1.0 = standard, 2.0 = crystal clear on retina) / Minimale scherpte (1.0 is standaard, 2.0 is extra scherp op luxe schermen) */
        dprMin: number;
        /** Maximum Device Pixel Ratio / Maximale scherpte factor */
        dprMax: number;
        /** Smooth edges on 3D objects / Gladde randen aan 3D objecten (verwijdert kartels) */
        antialias: boolean;
        /** Texture sharpness when looking at angles / Scherpte van texturen onder een hoek */
        anisotropy: number;
        /** Overall brightness of the 3D scene / Algehele helderheid van de 3D scene */
        toneMappingExposure?: number;
    };
    /** Shadow rendering configuration / Instellingen voor schaduwen */
    shadows: {
        /** Enable/Disable sun shadows / Schakel zon-schaduwen aan/uit */
        enabled: boolean;
        /** Resolution of the shadow map (higher = sharper) / Resolutie van de schaduw (hoger is scherper) */
        shadowMapSize: number;
        /** Offset to prevent shadow artifacts on surfaces / Correctie om strepen op beton te voorkomen */
        shadowBias: number;
        /** Enable soft shadows under the objects / Zachte schaduw direct onder de banken aan/uit */
        contactShadowsEnabled: boolean;
        contactShadows: {
            /** Darkness of the soft shadow / Hoe donker is de zachte schaduw */
            opacity: number;
            /** Softness of the shadow edge / Hoe wazig/zacht is de rand */
            blur: number;
            /** How far the shadow reaches / Hoe ver de schaduw naar beneden "straalt" */
            far: number;
            /** Detail of the contact shadow / Detailniveau van deze schaduw */
            resolution: number;
            /** Size of the shadow area / Grootte van het schaduwvlak */
            scale: number;
        };
    };
    /** Global lighting intensities / Sterkte van de globale lampen */
    lighting: {
        /** General non-directional light / Algemeen licht van alle kanten */
        ambientIntensity: number;
        /** Light from the sky vs ground / Licht van de lucht vs de grond */
        hemisphereIntensity: number;
        /** Intensity of the main sun lamp / Sterkte van de hoofd-zonlamp */
        directionalIntensity: number;
        /** If the sun should cast a shadow / Of de zon een schaduw werpt */
        directionalCastsShadow: boolean;
    };
    /** Environment reflection settings / Instellingen voor reflecties van de omgeving */
    environment: {
        /** HDR image used for lighting / HDR afbeelding gebruikt voor belichting */
        preset: 'city' | 'apartment' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse';
        /** Strength of the reflections / Sterkte van de reflecties */
        intensity: number;
        /** How blurry the reflections are / Hoe wazig de reflecties zijn */
        blur: number;
    };
    /** Bench material detail / Detailniveau van het beton en de texturen */
    materials: {
        /** Enable the fine grain/bump on the surface / Fijne korrel/structuur op het oppervlak tonen */
        useFinishBump: boolean;
        /** Multiplier for the grain depth / Sterkte van de korrel-diepte */
        finishBumpMultiplier: number;
    };
    /** Grass performance and visuals / Prestaties en uiterlijk van het gras */
    grass: {
        /** How many grass blades are shown (1.0 = 1 million) / Hoeveelheid grassprieten (1.0 = 1 miljoen) */
        densityFactor: number;
        /** Use realistic light calculations for grass / Realistische lichtval op elke spriet */
        usePBR: boolean;
        /** Quality of the wind animation / Kwaliteit van de wind-beweging */
        windQuality: 'low' | 'high';
        /** If grass casts a shadow (very heavy!) / Of gras een schaduw werpt (erg zwaar!) */
        castShadows: boolean;
        /** If grass can receive a shadow / Of er schaduwen op het gras kunnen vallen */
        receiveShadows: boolean;
    };
}

export const QUALITY_CONFIG: Record<QualityTier, QualityProfile> = {
    low: {
        renderer: {
            dprMin: 1.0,
            dprMax: 1.0,
            antialias: false,
            anisotropy: 1,
            toneMappingExposure: 1.0,
        },
        shadows: {
            enabled: false,
            shadowMapSize: 0,
            shadowBias: 0,
            contactShadowsEnabled: false,
            contactShadows: {
                opacity: 0,
                blur: 0,
                far: 0,
                resolution: 256,
                scale: 60,
            },
        },
        lighting: {
            ambientIntensity: 0.6,
            hemisphereIntensity: 0.4,
            directionalIntensity: 0.4,
            directionalCastsShadow: false,
        },
        environment: {
            preset: 'city',
            intensity: 0.5,
            blur: 1.0,
        },
        materials: {
            useFinishBump: false,
            finishBumpMultiplier: 0.0,
        },
        grass: {
            densityFactor: 0.1,
            usePBR: false,
            windQuality: 'low',
            castShadows: false,
            receiveShadows: false,
        },
    },
    high: {
        renderer: {
            dprMin: 1.0,
            dprMax: 2.0,
            antialias: true,
            anisotropy: 8,
            toneMappingExposure: 1.0,
        },
        shadows: {
            enabled: true,
            shadowMapSize: 1024,
            shadowBias: -0.0001,
            contactShadowsEnabled: true,
            contactShadows: {
                opacity: 0.4,
                blur: 2.5,
                far: 2,
                resolution: 1024,
                scale: 60,
            },
        },
        lighting: {
            ambientIntensity: 0.2,
            hemisphereIntensity: 0.4,
            directionalIntensity: 0.8,
            directionalCastsShadow: true,
        },
        environment: {
            preset: 'city',
            intensity: 1.0,
            blur: 0.5,
        },
        materials: {
            useFinishBump: true,
            finishBumpMultiplier: 1.0,
        },
        grass: {
            densityFactor: 1.0,
            usePBR: true,
            windQuality: 'high',
            castShadows: true,
            receiveShadows: true,
        },
    },
};
