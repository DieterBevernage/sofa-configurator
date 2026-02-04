import type { BenchVariant } from '../types';

export interface ProductDefinition {
    id: BenchVariant;
    label: string;
    width: number;
    depth: number;
    height: number;
    type: 'concrete' | 'glb';
    modelPath?: string; // Only for GLB
    category: 'bench' | 'environment'; // environment items like tree/human
}

export const PRODUCTS: Record<string, ProductDefinition> = {
    // Concrete Benches
    'standard': {
        id: 'standard',
        label: 'Betonbank Standaard',
        width: 1.5,
        depth: 0.5,
        height: 0.45,
        type: 'concrete',
        category: 'bench'
    },
    'backrest': {
        id: 'backrest',
        label: 'Met Rugleuning',
        width: 1.5,
        depth: 0.5,
        height: 0.45,
        type: 'concrete',
        category: 'bench'
    },
    'planter': {
        id: 'planter',
        label: 'Met Plantenbak',
        width: 1.5,
        depth: 0.5,
        height: 0.45,
        type: 'concrete',
        category: 'bench'
    },
    'solar': {
        id: 'solar',
        label: 'Met Zonnepaneel',
        width: 1.5,
        depth: 0.5,
        height: 0.45,
        type: 'concrete',
        category: 'bench'
    },
    // Custom GLB Models
    'SF-S1': {
        id: 'SF-S1',
        label: 'Model SF-S1',
        width: 0.6,
        depth: 0.5,
        height: 0.45,
        type: 'glb',
        modelPath: '/Zitbanken/SF-S1.glb',
        category: 'bench'
    },
    'SF-S2': {
        id: 'SF-S2',
        label: 'Model SF-S2',
        width: 1.2,
        depth: 0.5,
        height: 0.45,
        type: 'glb',
        modelPath: '/Zitbanken/SF-S2.glb',
        category: 'bench'
    },
    // Environment
    'tree': {
        id: 'tree',
        label: 'Boom',
        width: 0.8,
        depth: 0.8,
        height: 2.0,
        type: 'concrete', // placeholder type
        category: 'environment'
    },
    'human': {
        id: 'human',
        label: 'Persoon',
        width: 0.5,
        depth: 0.5,
        height: 1.8,
        type: 'concrete', // placeholder type
        category: 'environment'
    }
};

export const getProduct = (variant: string) => PRODUCTS[variant];
