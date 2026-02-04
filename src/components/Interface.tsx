import { useConfiguratorStore } from '../store/useConfiguratorStore'
import { PRODUCTS } from '../config/products';;
import type { BenchVariant } from '../types';
import { PropertiesPanel } from './PropertiesPanel';
import { useState, useRef } from 'react';
import { Leaf, Box as BoxIcon, Zap, Sparkles, ChevronDown, Undo2, Redo2, FileUp, Layers, X, Sun, Moon } from 'lucide-react';
import { MouseLeftClick, MouseMiddleClick, MouseScroll } from './MouseIcons';
import { useSceneStore } from '../store/useSceneStore';
import { parseDxfFile } from '../utils/dxfParser';

const DraggableItem = ({ variant, label }: { variant: BenchVariant; label: string }) => {
    const setDraggingItem = useConfiguratorStore((state) => state.setDraggingItem);

    return (
        <div
            className="p-4 bg-white rounded-lg shadow-md cursor-grab active:cursor-grabbing hover:bg-gray-50 border border-gray-200 transition-colors"
            draggable
            onDragStart={(e) => {
                setDraggingItem(variant);
                e.dataTransfer.setData('variant', variant);
                // Create a transparent drag image or use default
            }}
            onDragEnd={() => setDraggingItem(null)}
        >
            <div className="w-16 h-16 bg-gray-200 mb-2 rounded flex items-center justify-center text-xs text-gray-500">
                Icon
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
    );
};

export const Interface = () => {
    const [activeTab, setActiveTab] = useState<'benches' | 'environment'>('benches');
    const showGrass = useConfiguratorStore((state) => state.showGrass);
    const setShowGrass = useConfiguratorStore((state) => state.setShowGrass);
    const triplanarEnabled = useConfiguratorStore((state) => state.triplanarEnabled);
    const setTriplanarEnabled = useConfiguratorStore((state) => state.setTriplanarEnabled);
    const renderingQuality = useConfiguratorStore((state) => state.renderingQuality);
    const setRenderingQuality = useConfiguratorStore((state) => state.setRenderingQuality);
    const selectedId = useConfiguratorStore((state) => state.selectedId);

    const [isQualityOpen, setIsQualityOpen] = useState(false);
    const [isSceneOpen, setIsSceneOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedScene = useSceneStore((state) => state.selectedScene);
    const setSelectedScene = useSceneStore((state) => state.setSelectedScene);
    const setImportedDxfData = useSceneStore((state) => state.setImportedDxfData);
    const clearDxfData = useSceneStore((state) => state.clearDxfData);
    const dxfFileName = useSceneStore((state) => state.dxfFileName);
    const manualScale = useSceneStore((state) => state.manualScale);
    const setManualScale = useSceneStore((state) => state.setManualScale);

    const undo = useConfiguratorStore((state) => state.undo);
    const redo = useConfiguratorStore((state) => state.redo);
    const history = useConfiguratorStore((state) => state.history);
    const future = useConfiguratorStore((state) => state.future);
    const sunIntensity = useConfiguratorStore((state) => state.sunIntensity);
    const setSunIntensity = useConfiguratorStore((state) => state.setSunIntensity);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const isDwg = file.name.toLowerCase().endsWith('.dwg');
        const isDxf = file.name.toLowerCase().endsWith('.dxf');

        if (!isDwg && !isDxf) {
            alert('⚠️ Alleen DXF en DWG bestanden worden ondersteund.');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        // Handle DWG files
        if (isDwg) {
            try {
                // Import converter dynamically
                const { convertDwgToDxf } = await import('../utils/dwgConverter');
                const result = await convertDwgToDxf(file);

                if (result.success && result.dxfContent) {
                    // Successfully converted - parse the DXF content
                    const dxfBlob = new Blob([result.dxfContent], { type: 'text/plain' });
                    const dxfFile = new File([dxfBlob], file.name.replace('.dwg', '.dxf'), { type: 'text/plain' });

                    const { entities, unit, scaleFactor } = await parseDxfFile(dxfFile);

                    if (entities.length === 0) {
                        alert('⚠️ Geen tekenelementen gevonden in het geconverteerde bestand.');
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }
                        return;
                    }

                    setImportedDxfData(entities, file.name, unit, scaleFactor);
                    setIsSceneOpen(false);
                } else {
                    // Conversion not available - show professional message
                    alert(
                        '⚠️ DWG Conversie\n\n' +
                        'Automatische DWG conversie is momenteel in ontwikkeling.\n\n' +
                        'Exporteer het bestand als DXF vanuit je CAD software:\n' +
                        '• AutoCAD: File → Save As → DXF\n' +
                        '• LibreCAD: File → Export → DXF\n' +
                        '• DraftSight: File → Save As → DXF\n\n' +
                        'Upload vervolgens het DXF bestand.'
                    );
                }
            } catch (error) {
                console.error('DWG processing error:', error);
                alert(
                    '❌ Fout bij het verwerken van het DWG bestand.\n\n' +
                    'Exporteer het bestand als DXF vanuit je CAD software en probeer opnieuw.'
                );
            }

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        // Handle DXF files (existing logic)
        try {
            const { entities, unit, scaleFactor } = await parseDxfFile(file);

            if (entities.length === 0) {
                alert('⚠️ Geen tekenelementen gevonden in het DXF bestand.\n\nControleer of het bestand geldig is en tekeningen bevat.');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            setImportedDxfData(entities, file.name, unit, scaleFactor);
            setIsSceneOpen(false);
        } catch (error) {
            console.error('Error parsing DXF file:', error);
            alert(
                '❌ Fout bij het laden van het DXF bestand.\n\n' +
                'Mogelijke oorzaken:\n' +
                '• Het bestand is beschadigd\n' +
                '• Het DXF formaat wordt niet ondersteund\n' +
                '• Het bestand is te complex\n\n' +
                'Probeer het bestand opnieuw te exporteren als DXF (ASCII formaat).'
            );
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSceneSelect = (scene: 'scene1' | 'scene2' | 'scene3' | 'dwg-dxf') => {
        if (scene === 'dwg-dxf') {
            fileInputRef.current?.click();
        } else {
            setSelectedScene(scene);
            setIsSceneOpen(false);
        }
    };

    const getSceneLabel = () => {
        if (selectedScene === 'dwg-dxf' && dxfFileName) {
            return dxfFileName.length > 12 ? dxfFileName.substring(0, 12) + '...' : dxfFileName;
        }
        switch (selectedScene) {
            case 'scene1': return 'Scene 1';
            case 'scene2': return 'Scene 2';
            case 'scene3': return 'Scene 3';
            case 'dwg-dxf': return 'DWG/DXF';
        }
    };

    return (
        <div className="absolute inset-0 pointer-events-none flex z-50">
            {/* Left Sidebar - Catalogue */}
            <div className="w-80 bg-white/90 backdrop-blur-md h-full pointer-events-auto p-4 shadow-xl border-r border-gray-200 flex flex-col">
                <div className="bg-white p-4 rounded-xl shadow-xl flex flex-col gap-4 h-full">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-full">
                            <button
                                onClick={() => setActiveTab('benches')}
                                className={`flex-1 py-1 px-2 rounded-md text-sm font-medium transition-all ${activeTab === 'benches' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Zitbanken
                            </button>
                            <button
                                onClick={() => setActiveTab('environment')}
                                className={`flex-1 py-1 px-2 rounded-md text-sm font-medium transition-all ${activeTab === 'environment' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Omgeving
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0">
                        {activeTab === 'benches' ? (
                            <div className="grid grid-cols-2 gap-4">
                                {Object.values(PRODUCTS)
                                    .filter(p => p.category === 'bench')
                                    .map(product => (
                                        <DraggableItem
                                            key={product.id}
                                            variant={product.id}
                                            label={product.label}
                                        />
                                    ))}
                            </div>
                        ) : (
                            <>
                                <DraggableItem variant="tree" label="Boom" />
                                <DraggableItem variant="human" label="Persoon" />
                            </>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-auto shrink-0">
                        <button
                            onClick={() => useConfiguratorStore.getState().setOrderOpen(true)}
                            className="w-full py-3 text-white font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98]"
                            style={{ backgroundColor: '#6d7759' }}
                        >
                            <span>Bestellen</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Top Left Controls - Grouped Horizontally */}
            <div className="absolute top-4 left-96 pointer-events-auto flex gap-2 items-start">
                <button
                    onClick={() => setShowGrass(!showGrass)}
                    className={`w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${showGrass ? 'text-green-600' : 'text-gray-400'}`}
                    title="Gras aan/uit"
                >
                    <Leaf size={24} fill={showGrass ? "currentColor" : "none"} strokeWidth={2} />
                </button>

                <button
                    onClick={() => setTriplanarEnabled(!triplanarEnabled)}
                    className={`w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${triplanarEnabled ? 'text-blue-600' : 'text-gray-400'}`}
                    title="Triplanar Mapping (UV-loos)"
                >
                    <BoxIcon size={24} fill={triplanarEnabled ? "currentColor" : "none"} strokeWidth={2} />
                </button>

                {/* Quality Switcher */}
                <div className="relative">
                    <button
                        onClick={() => setIsQualityOpen(!isQualityOpen)}
                        className={`px-3 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${renderingQuality === 'high' ? 'text-purple-600' : 'text-orange-500'}`}
                        title="Rendering Kwaliteit"
                    >
                        {renderingQuality === 'high' ? <Sparkles size={20} /> : <Zap size={20} />}
                        <span className="text-xs font-bold uppercase tracking-wider">{renderingQuality}</span>
                        <ChevronDown size={16} className={`transition-transform ${isQualityOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isQualityOpen && (
                        <div className="absolute top-14 left-0 w-32 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden z-[100]">
                            <button
                                onClick={() => { setRenderingQuality('low'); setIsQualityOpen(false); }}
                                className={`w-full px-4 py-2 flex items-center gap-2 text-sm transition-colors hover:bg-orange-50 ${renderingQuality === 'low' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-gray-600'}`}
                            >
                                <Zap size={16} /> Low
                            </button>
                            <button
                                onClick={() => { setRenderingQuality('high'); setIsQualityOpen(false); }}
                                className={`w-full px-4 py-2 flex items-center gap-2 text-sm transition-colors hover:bg-purple-50 ${renderingQuality === 'high' ? 'bg-purple-50 text-purple-600 font-bold' : 'text-gray-600'}`}
                            >
                                <Sparkles size={16} /> High
                            </button>
                        </div>
                    )}
                </div>

                {/* Undo / Redo Controls */}
                <div className="flex gap-2">
                    <button
                        onClick={undo}
                        disabled={history.length === 0}
                        className={`w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none`}
                        style={{ color: '#6d7759' }}
                        title="Ongedaan maken (Ctrl+Z)"
                    >
                        <Undo2 size={24} />
                    </button>
                    <button
                        onClick={redo}
                        disabled={future.length === 0}
                        className={`w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none`}
                        style={{ color: '#6d7759' }}
                        title="Opnieuw (Ctrl+Y)"
                    >
                        <Redo2 size={24} />
                    </button>
                </div>
            </div>

            {/* Top Right Controls - Scene Selector (before properties panel, moves with it) */}
            <div className={`absolute top-4 ${selectedId ? 'right-[480px]' : 'right-[180px]'} transition-all duration-300 pointer-events-auto flex gap-2 items-start`}>
                {/* Scene Selector Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsSceneOpen(!isSceneOpen)}
                        className={`px-3 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${selectedScene === 'dwg-dxf' && dxfFileName ? 'text-green-600' : 'text-gray-600'}`}
                        title="Scene Selectie"
                    >
                        <Layers size={20} />
                        <span className="text-xs font-bold uppercase tracking-wider">{getSceneLabel()}</span>
                        <ChevronDown size={16} className={`transition-transform ${isSceneOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSceneOpen && (
                        <div className="absolute top-14 left-0 w-40 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden z-[100]">
                            <button
                                onClick={() => handleSceneSelect('scene1')}
                                className={`w-full px-4 py-2 flex items-center gap-2 text-sm transition-colors hover:bg-gray-50 ${selectedScene === 'scene1' ? 'bg-gray-50 text-gray-800 font-bold' : 'text-gray-600'}`}
                            >
                                Scene 1
                            </button>
                            <button
                                onClick={() => handleSceneSelect('scene2')}
                                className={`w-full px-4 py-2 flex items-center gap-2 text-sm transition-colors hover:bg-gray-50 ${selectedScene === 'scene2' ? 'bg-gray-50 text-gray-800 font-bold' : 'text-gray-600'}`}
                            >
                                Scene 2
                            </button>
                            <button
                                onClick={() => handleSceneSelect('scene3')}
                                className={`w-full px-4 py-2 flex items-center gap-2 text-sm transition-colors hover:bg-gray-50 ${selectedScene === 'scene3' ? 'bg-gray-50 text-gray-800 font-bold' : 'text-gray-600'}`}
                            >
                                Scene 3
                            </button>
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                                onClick={() => handleSceneSelect('dwg-dxf')}
                                className={`w-full px-4 py-2 flex items-center gap-2 text-sm transition-colors hover:bg-green-50 ${selectedScene === 'dwg-dxf' ? 'bg-green-50 text-green-600 font-bold' : 'text-gray-600'}`}
                            >
                                <FileUp size={16} />
                                DWG/DXF
                            </button>
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".dxf,.dwg"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </div>

                {/* DXF Controls - Show when DXF is loaded */}
                {dxfFileName && (
                    <>
                        {/* Delete DXF Button */}
                        <button
                            onClick={() => {
                                if (confirm(`DXF bestand "${dxfFileName}" verwijderen?`)) {
                                    clearDxfData();
                                }
                            }}
                            className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 hover:bg-red-50 hover:border-red-300 text-gray-600 hover:text-red-600"
                            title={`Verwijder ${dxfFileName}`}
                        >
                            <X size={20} />
                        </button>

                        {/* Scale Input */}
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-3 h-12">
                            <span className="text-xs font-medium text-gray-600">Schaal:</span>
                            <input
                                type="number"
                                value={manualScale}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value) && value > 0) {
                                        setManualScale(value);
                                    }
                                }}
                                step="0.1"
                                min="0.01"
                                max="100"
                                className="w-16 text-sm font-mono text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0"
                            />
                            <span className="text-xs text-gray-400">×</span>
                        </div>
                    </>
                )}
            </div>

            {/* Right Sidebar - Properties */}
            <div className="ml-auto h-full">
                <PropertiesPanel />
            </div>

            {/* Bottom Center - Sun/Moon Slider */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto">
                <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4">
                    <Sun size={20} className="text-yellow-500" />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={1 - sunIntensity} // 0 is left (Sun), should mean sunIntensity = 1
                        onChange={(e) => setSunIntensity(1 - parseFloat(e.target.value))}
                        className="w-48 h-2 bg-gradient-to-r from-yellow-400 via-yellow-100 to-blue-900 rounded-full appearance-none cursor-pointer
                                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg
                                   [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-300
                                   [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
                                   [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 
                                   [&::-moz-range-thumb]:border-gray-300 [&::-moz-range-thumb]:border-none"
                        title={`Zonlicht intensiteit: ${Math.round(sunIntensity * 100)}%`}
                    />
                    <Moon size={20} className="text-blue-400" />
                </div>
            </div>

            {/* Bottom Center - Instructions / Uitleg besturing */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
                <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-8 text-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center text-gray-900">
                            <MouseLeftClick size={22} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">Linkermuis</span>
                            <span className="text-xs font-medium">Selectie & Rotatie</span>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-gray-200" />

                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center text-gray-900">
                            <MouseMiddleClick size={22} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">Middenmuis</span>
                            <span className="text-xs font-medium">Pannen</span>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-gray-200" />

                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center text-gray-900">
                            <MouseScroll size={22} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">Scroll</span>
                            <span className="text-xs font-medium">Zoomen</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
