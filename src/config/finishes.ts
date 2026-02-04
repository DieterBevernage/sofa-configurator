import type { BenchFinish } from '../types';

export interface FinishDefinition {
    id: BenchFinish;
    label: string;
    bumpMapPath: string;
    bumpIntensity: number;
    tileSizeMeters: number;
    roughness: number;
    envMapIntensity: number;
    description: string;
}

export const FINISHES: Record<BenchFinish, FinishDefinition> = {
    'glad': {
        id: 'glad',
        label: 'Glad',
        bumpMapPath: '/Finishes/glad_bump.png',
        bumpIntensity: 0.01,
        tileSizeMeters: 0.5,
        roughness: 0.3,
        envMapIntensity: 1.5,
        description: 'Gladde afwerking voor een strakke look.'
    },
    'gezuurd': {
        id: 'gezuurd',
        label: 'Gezuurd',
        bumpMapPath: '/Finishes/gezuurd_bump.png',
        bumpIntensity: 0.1,
        tileSizeMeters: 0.15,
        roughness: 0.8,
        envMapIntensity: 0.8,
        description: 'Licht geëtst oppervlak met fijne textuur.'
    },
    'uitgewassen': {
        id: 'uitgewassen',
        label: 'Uitgewassen',
        bumpMapPath: '/Finishes/uitgewassen_bump.png',
        bumpIntensity: 0.1,
        tileSizeMeters: 0.20,
        roughness: 0.8,
        envMapIntensity: 0.5,
        description: 'Zichtbare grindkorrels voor een robuust effect.'
    }
};

export const getFinish = (id: BenchFinish) => FINISHES[id];
