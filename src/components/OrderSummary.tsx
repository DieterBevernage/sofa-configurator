import { useConfiguratorStore } from '../store/useConfiguratorStore';
import { getProduct } from '../config/products';
import { X, User, MapPin, ClipboardList, Info, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

export function OrderSummary() {
    const modules = useConfiguratorStore((state) => state.modules);
    const setOrderOpen = useConfiguratorStore((state) => state.setOrderOpen);
    const isOrderOpen = useConfiguratorStore((state) => state.isOrderOpen);

    // Form State
    const [formData, setFormData] = useState({
        aanvragerNaam: '',
        aanvragerEmail: '',
        aanvragerTelefoon: '',
        aanvragerAdres: '',
        aanvragerGemeente: '',
        bouwplaatsAdres: '',
        bouwplaatsGemeente: '',
        isSameAddress: false
    });

    if (!isOrderOpen) return null;

    const benchModules = modules.filter(m => m.type === 'bench');

    // Group items by variant, finish, and color
    const stats = benchModules.reduce((acc, bench) => {
        const color = bench.color || 'Grijs';
        const finish = bench.finish || 'Glad';
        const key = `${bench.variant}-${finish}-${color}`;

        if (!acc[key]) {
            const product = getProduct(bench.variant);
            acc[key] = {
                count: 0,
                name: product ? product.label : 'Onbekend',
                finish: finish,
                color: color
            };
        }
        acc[key].count++;
        return acc;
    }, {} as Record<string, { count: number, name: string, finish: string, color: string }>);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Validation
    const isFormValid = () => {
        const requiredFields = [
            formData.aanvragerNaam,
            formData.aanvragerEmail,
            formData.aanvragerTelefoon,
            formData.aanvragerAdres,
            formData.aanvragerGemeente
        ];

        if (!formData.isSameAddress) {
            requiredFields.push(formData.bouwplaatsAdres, formData.bouwplaatsGemeente);
        }

        return requiredFields.every(field => field.trim() !== '') && benchModules.length > 0;
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="text-[#6d7759]" size={28} />
                        <h2 className="text-2xl font-bold text-gray-800">Aanvraag Overzicht</h2>
                    </div>
                    <button
                        onClick={() => setOrderOpen(false)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="space-y-8">
                        {/* Summary List */}
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Geselecteerde Producten</h3>
                            <div className="grid gap-3">
                                {Object.entries(stats).map(([key, item]) => (
                                    <div key={key} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-gray-700 font-bold border border-gray-100">
                                                {item.count}x
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{item.name}</span>
                                                <div className="flex gap-4 text-xs text-gray-500 font-medium">
                                                    <span>Afwerking: <span className="text-gray-700">{item.finish}</span></span>
                                                    <span>Kleur: <span className="text-gray-700">{item.color}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {benchModules.length === 0 && (
                                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 italic">
                                        Geen zitbanken geselecteerd in uw ontwerp.
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Gegevens Aanvrager */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <User size={18} className="text-[#6d7759]" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">Gegevens Aanvrager</h3>
                                </div>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        name="aanvragerNaam"
                                        placeholder="Naam / Bedrijf *"
                                        value={formData.aanvragerNaam}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6d7759]/20 focus:border-[#6d7759] outline-none transition-all text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                type="email"
                                                name="aanvragerEmail"
                                                placeholder="E-mail *"
                                                value={formData.aanvragerEmail}
                                                onChange={handleInputChange}
                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6d7759]/20 focus:border-[#6d7759] outline-none transition-all text-sm"
                                            />
                                        </div>
                                        <div className="relative flex-1">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                            <input
                                                type="tel"
                                                name="aanvragerTelefoon"
                                                placeholder="Tel *"
                                                value={formData.aanvragerTelefoon}
                                                onChange={handleInputChange}
                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6d7759]/20 focus:border-[#6d7759] outline-none transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        name="aanvragerAdres"
                                        placeholder="Adres (Straat + Nr) *"
                                        value={formData.aanvragerAdres}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6d7759]/20 focus:border-[#6d7759] outline-none transition-all text-sm"
                                    />
                                    <input
                                        type="text"
                                        name="aanvragerGemeente"
                                        placeholder="Postcode + Gemeente *"
                                        value={formData.aanvragerGemeente}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6d7759]/20 focus:border-[#6d7759] outline-none transition-all text-sm"
                                    />
                                </div>
                            </section>

                            {/* Bouwplaats */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <MapPin size={18} className="text-[#6d7759]" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">Bouwplaats</h3>
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isSameAddress"
                                            checked={formData.isSameAddress}
                                            onChange={handleInputChange}
                                            className="peer w-4 h-4 appearance-none rounded border border-gray-300 checked:bg-[#6d7759] checked:border-[#6d7759] transition-all cursor-pointer"
                                        />
                                        <svg className="absolute w-3 h-3 text-white p-0.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">Zelfde als aanvrager</span>
                                </label>

                                {!formData.isSameAddress ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <input
                                            type="text"
                                            name="bouwplaatsAdres"
                                            placeholder="Adres (Straat + Nr) *"
                                            value={formData.bouwplaatsAdres}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6d7759]/20 focus:border-[#6d7759] outline-none transition-all text-sm"
                                        />
                                        <input
                                            type="text"
                                            name="bouwplaatsGemeente"
                                            placeholder="Postcode + Gemeente *"
                                            value={formData.bouwplaatsGemeente}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6d7759]/20 focus:border-[#6d7759] outline-none transition-all text-sm"
                                        />
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 text-center italic flex flex-col items-center gap-2">
                                        <Info size={16} className="text-gray-300" />
                                        <span>Leveringsadres is gelijk aan bovenstaand adres.</span>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Guidance Text */}
                        <div className="flex gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 shadow-sm">
                            <Info size={24} className="shrink-0 text-blue-400" />
                            <p className="text-sm leading-relaxed">
                                Na het verzenden van uw aanvraag nemen wij zo spoedig mogelijk contact met u op voor een vrijblijvende offerte en advies.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer / Submit */}
                <div className="p-8 border-t border-gray-100 bg-gray-50">
                    <button
                        disabled={!isFormValid()}
                        className={`w-full py-4 text-white font-bold rounded-xl transition-all text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
                        style={{ backgroundColor: isFormValid() ? '#6d7759' : '#a0a0a0' }}
                    >
                        <span>Aanvraag Verzenden</span>
                    </button>
                    {!isFormValid() && benchModules.length > 0 && (
                        <p className="text-center text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">Vul alle verplichte velden (*) in</p>
                    )}
                </div>
            </div>
        </div>
    );
}
