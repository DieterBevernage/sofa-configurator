export type BenchVariant = 'standard' | 'backrest' | 'planter' | 'solar' | 'SF-S1' | 'SF-S2' | 'tree' | 'human' | 'lamp';
export type BenchColor = 'Groen' | 'Rood' | 'Grijs' | 'Zwart' | 'Wit' | 'Lichtgrijs' | 'Beige';
export type BenchFinish = 'glad' | 'gezuurd' | 'uitgewassen';

export interface Module {
    id: string;
    type: 'bench' | 'environment';
    variant: BenchVariant;
    position: [number, number, number];
    rotation: [number, number, number];
    isColliding?: boolean;
    color?: BenchColor; // Only for benches
    finish?: BenchFinish; // New
}

export interface BenchProps extends Module {
    selected?: boolean;
    onSelect?: (id: string) => void;
    onRotate?: (angle: number) => void;
    pointerEvents?: any;
    onPointerDown?: (e: any) => void;
}
