import { create } from 'zustand';
import type { BenchVariant, Module, BenchFinish } from '../types';

interface ConfiguratorState {
    modules: Module[];
    selectedId: string | null;
    draggingItem: BenchVariant | null;
    pendingDrop: { x: number; y: number; variant: BenchVariant } | null;

    addModule: (module: Module) => void;
    removeModule: (id: string) => void;
    updateModule: (id: string, updates: Partial<Module>) => void;
    selectModule: (id: string | null) => void;
    setDraggingItem: (variant: BenchVariant | null) => void;
    setPendingDrop: (drop: { x: number; y: number; variant: BenchVariant } | null) => void;
    draggingId: string | null;

    setDraggingId: (id: string | null) => void;
    isRotating: boolean;
    setIsRotating: (v: boolean) => void;
    dragStartPos: { position: [number, number, number], rotation: [number, number, number] } | null;
    setDragStartPos: (pos: { position: [number, number, number], rotation: [number, number, number] } | null) => void;

    isOrderOpen: boolean;
    setOrderOpen: (v: boolean) => void;
    showGrass: boolean;
    setShowGrass: (v: boolean) => void;
    triplanarEnabled: boolean;
    setTriplanarEnabled: (v: boolean) => void;
    renderingQuality: 'low' | 'high';
    setRenderingQuality: (v: 'low' | 'high') => void;
    sunIntensity: number; // 0 to 1, controls directional light
    setSunIntensity: (intensity: number) => void;
    defaultFinish: BenchFinish;
    setDefaultFinish: (v: BenchFinish) => void;

    // History for Undo/Redo
    history: Module[][];
    future: Module[][];
    undo: () => void;
    redo: () => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
    modules: [],
    selectedId: null,
    draggingItem: null,
    pendingDrop: null,

    draggingId: null,
    isRotating: false,
    dragStartPos: null,
    isOrderOpen: false,
    showGrass: false,
    triplanarEnabled: true,
    renderingQuality: 'high',
    history: [],
    future: [],

    setOrderOpen: (v) => set({ isOrderOpen: v }),
    setShowGrass: (v) => set({ showGrass: v }),
    setTriplanarEnabled: (v) => set({ triplanarEnabled: v }),
    setRenderingQuality: (v) => set({ renderingQuality: v }),
    sunIntensity: 0.8, // Default sun intensity (0=night, 1=full sun)
    setSunIntensity: (v) => set({ sunIntensity: v }),
    defaultFinish: 'glad',
    setDefaultFinish: (v) => set({ defaultFinish: v }),

    addModule: (module) => set((state) => ({
        history: [...state.history.slice(-29), state.modules],
        future: [],
        modules: [...state.modules, module],
        selectedId: module.id
    })),

    setIsRotating: (v) => set({ isRotating: v }),

    removeModule: (id) => set((state) => ({
        history: [...state.history.slice(-29), state.modules],
        future: [],
        modules: state.modules.filter((m) => m.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId
    })),

    updateModule: (id, updates) => set((state) => {
        // Only save to history if it's a significant move/change (not continuous dragging)
        // For simplicity here, we'll save if dragging stops or it's a direct update
        return {
            modules: state.modules.map((m) => m.id === id ? { ...m, ...updates } : m)
        };
    }),

    undo: () => set((state) => {
        if (state.history.length === 0) return state;
        const previous = state.history[state.history.length - 1];
        const newHistory = state.history.slice(0, -1);
        return {
            history: newHistory,
            future: [state.modules, ...state.future.slice(0, 29)],
            modules: previous,
            selectedId: null
        };
    }),

    redo: () => set((state) => {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        return {
            history: [...state.history.slice(-29), state.modules],
            future: newFuture,
            modules: next,
            selectedId: null
        };
    }),

    selectModule: (id) => set({ selectedId: id }),

    setDraggingItem: (variant) => set({ draggingItem: variant }),

    setPendingDrop: (drop) => set({ pendingDrop: drop }),

    setDraggingId: (id: string | null) => set((state) => {
        // When starting drag, save current state to history BEFORE the move happens
        if (id) {
            const m = state.modules.find(x => x.id === id);
            return {
                history: [...state.history.slice(-29), state.modules],
                future: [],
                draggingId: id,
                dragStartPos: m ? { position: m.position, rotation: m.rotation } : null
            };
        }
        return { draggingId: id, dragStartPos: null };
    }),

    setDragStartPos: (pos) => set({ dragStartPos: pos }),
}));
