import { create } from 'zustand';

interface DxfEntity {
    type: string;
    vertices?: Array<{ x: number; y: number; z?: number }>;
    center?: { x: number; y: number; z?: number };
    radius?: number;
    startAngle?: number;
    endAngle?: number;
}

interface SceneStore {
    selectedScene: 'scene1' | 'scene2' | 'scene3' | 'dwg-dxf';
    importedDxfData: DxfEntity[] | null;
    dxfFileName: string | null;
    dxfUnit: string | null;
    dxfScaleFactor: number | null;
    manualScale: number; // User-adjustable scale multiplier
    setSelectedScene: (scene: 'scene1' | 'scene2' | 'scene3' | 'dwg-dxf') => void;
    setImportedDxfData: (data: DxfEntity[], fileName: string, unit?: string, scaleFactor?: number) => void;
    setManualScale: (scale: number) => void;
    clearDxfData: () => void;
}

export const useSceneStore = create<SceneStore>((set) => ({
    selectedScene: 'scene1',
    importedDxfData: null,
    dxfFileName: null,
    dxfUnit: null,
    dxfScaleFactor: null,
    manualScale: 1.0,
    setSelectedScene: (scene) => set({ selectedScene: scene }),
    setImportedDxfData: (data, fileName, unit, scaleFactor) => set({
        importedDxfData: data,
        dxfFileName: fileName,
        dxfUnit: unit || null,
        dxfScaleFactor: scaleFactor || null,
        manualScale: 1.0, // Reset manual scale when new file is loaded
        selectedScene: 'dwg-dxf'
    }),
    setManualScale: (scale) => set({ manualScale: scale }),
    clearDxfData: () => set({
        importedDxfData: null,
        dxfFileName: null,
        dxfUnit: null,
        dxfScaleFactor: null,
        manualScale: 1.0,
        selectedScene: 'scene1'
    }),
}));
