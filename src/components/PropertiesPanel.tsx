import { useConfiguratorStore } from '../store/useConfiguratorStore';
import type { BenchVariant } from '../types';
import { Trash2, Copy } from 'lucide-react';

export const PropertiesPanel = () => {
    const selectedId = useConfiguratorStore((state) => state.selectedId);
    const modules = useConfiguratorStore((state) => state.modules);
    const updateModule = useConfiguratorStore((state) => state.updateModule);
    const removeModule = useConfiguratorStore((state) => state.removeModule);
    const addModule = useConfiguratorStore((state) => state.addModule);

    const selectedModule = modules.find((m) => m.id === selectedId);

    if (!selectedModule) return null;

    const handleChangeVariant = (variant: BenchVariant) => {
        if (selectedId) updateModule(selectedId, { variant });
    };

    const handleDuplicate = () => {
        if (selectedModule) {
            addModule({
                ...selectedModule,
                id: Math.random().toString(36).substr(2, 9),
                position: [selectedModule.position[0] + 1, selectedModule.position[1], selectedModule.position[2] + 1] // Offset slightly
            });
        }
    };

    return (
        <div className="w-64 bg-white/90 backdrop-blur-md h-full pointer-events-auto p-6 shadow-xl border-l border-gray-200 flex flex-col">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Eigenschappen</h2>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['standard', 'backrest', 'planter', 'solar'].map((v) => (
                            <button
                                key={v}
                                onClick={() => handleChangeVariant(v as BenchVariant)}
                                className={`p-2 text-sm rounded border ${selectedModule.variant === v
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedModule.type === 'bench' && (
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 mb-3">Kleur</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {['Groen', 'Rood', 'Grijs', 'Zwart', 'Wit', 'Lichtgrijs', 'Beige'].map((c) => (
                                <button
                                    key={c}
                                    title={c}
                                    onClick={() => selectedId && updateModule(selectedId, { color: c as any })}
                                    className={`w-8 h-8 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${selectedModule.color === c ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: getColorHex(c) }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {selectedModule.type === 'bench' && (
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 mb-3">Afwerking</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { id: 'glad', label: 'Glad' },
                                { id: 'gezuurd', label: 'Gezuurd' },
                                { id: 'uitgewassen', label: 'Uitgewassen' }
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => selectedId && updateModule(selectedId, { finish: f.id as any })}
                                    className={`p-2 text-sm rounded border text-left transition-colors ${(selectedModule.finish || 'glad') === f.id
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-6 mt-6 border-t border-gray-200 space-y-2">
                <button
                    onClick={handleDuplicate}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                >
                    <Copy size={16} /> Dupliceren
                </button>
                <button
                    onClick={() => selectedId && removeModule(selectedId)}
                    className="w-full py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 size={18} />
                    Verwijderen
                </button>
            </div>
        </div>
    );
};

function getColorHex(name: string) {
    switch (name) {
        case 'Groen': return '#4ade80'; // green-400
        case 'Rood': return '#f87171'; // red-400
        case 'Grijs': return '#6b7280'; // gray-500
        case 'Zwart': return '#1f2937'; // gray-800
        case 'Wit': return '#ffffff';
        case 'Lichtgrijs': return '#e5e7eb'; // gray-200
        case 'Beige': return '#d6cba0'; // custom beige
        default: return '#cccccc';
    }
}
