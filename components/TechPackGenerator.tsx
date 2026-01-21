import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { SourcingTechPackData } from '../types';
import { generateTechPackFromSourcing } from '../services/geminiService';
import { exportSourcingTechPackPDF } from '../services/pdfService';
import { Button } from './Button';
import { useAuth } from '../contexts/AuthContext';
import { incrementGenerations } from '../services/profileService';

interface TechPackGeneratorProps {
    onBack: () => void;
}

export const TechPackGenerator: React.FC<TechPackGeneratorProps> = ({ onBack }) => {
    const { profile } = useAuth();
    const [images, setImages] = useState<string[]>([]);
    const [quantity, setQuantity] = useState<number>(500);
    const [guidelines, setGuidelines] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SourcingTechPackData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync result to state for editing
    const [editData, setEditData] = useState<SourcingTechPackData | null>(null);

    useEffect(() => {
        if (result) {
            setEditData(JSON.parse(JSON.stringify(result)));
        }
    }, [result]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file: File) => {
            const reader = new FileReader();
            reader.onload = () => {
                setImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (images.length === 0) return;
        setLoading(true);
        try {
            const data = await generateTechPackFromSourcing(images, quantity, guidelines, profile?.api_keys?.gemini);
            setResult(data);
            if (profile?.id) {
                await incrementGenerations(profile.id, 1);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to generate tech pack. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!editData) return;

        const wb = XLSX.utils.book_new();

        // 1. STYLE INFO
        const styleInfo = [
            ["AZELIFY DESIGNER STUDIO - GARMENT TECH PACK"],
            ["Style Name:", editData.productInfo.styleName, "Date:", editData.productInfo.date, "Project ID:", editData.productInfo.projectId],
            ["Category:", editData.productInfo.category, "Total Quantity:", editData.productInfo.totalQuantity],
            ["Description:", editData.productInfo.description],
            []
        ];
        const wsStyle = XLSX.utils.aoa_to_sheet(styleInfo);
        XLSX.utils.book_append_sheet(wb, wsStyle, "Style Info");

        // 2. MEASUREMENTS
        const measurementHeaders = editData.measurements.length > 0
            ? ["Points of Measure", ...Object.keys(editData.measurements[0].sizes)]
            : ["Points of Measure"];
        const measurementRows = (editData.measurements || []).map(m => [
            m.pointsOfMeasure,
            ...Object.values(m.sizes || {})
        ]);
        const wsMeasurements = XLSX.utils.aoa_to_sheet([["MEASUREMENT & SIZE CHART"], measurementHeaders, ...measurementRows]);
        XLSX.utils.book_append_sheet(wb, wsMeasurements, "Measurements");

        // 3. BOM
        const bomHeaders = ["Item", "Description", "Color/Code", "Supplier", "Consumption"];
        const bomRows = (editData.bom || []).map(b => [b.item, b.description, b.colorCode, b.supplier, b.consumption]);
        const wsBOM = XLSX.utils.aoa_to_sheet([["BILL OF MATERIALS (BOM)"], bomHeaders, ...bomRows]);
        XLSX.utils.book_append_sheet(wb, wsBOM, "BOM");

        // 4. EMBELLISHMENTS
        const embHeaders = ["Type", "Technique", "Placement", "Size", "Color"];
        const embRows = (editData.embellishments || []).map(e => [e.type, e.technique, e.placement, e.size, e.color]);
        const wsEmb = XLSX.utils.aoa_to_sheet([["LOGO & EMBELLISHMENTS"], embHeaders, ...embRows]);
        XLSX.utils.book_append_sheet(wb, wsEmb, "Embellishments");

        // 5. CONSTRUCTION & QC
        const notesAndQC = [
            ["CONSTRUCTION NOTES"],
            ...(editData.constructionNotes || []).map(n => [n]),
            [],
            ["QC CHECKLIST"],
            ...(editData.qcChecklist || []).map(q => [q]),
            [],
            ["CUSTOMIZATION REQUESTS"],
            [editData.customizationRequests || ""]
        ];
        const wsMisc = XLSX.utils.aoa_to_sheet(notesAndQC);
        XLSX.utils.book_append_sheet(wb, wsMisc, "Construction & QC");

        XLSX.writeFile(wb, `${editData.productInfo.styleName}_TechPack.xlsx`);
    };

    const handlePdfExport = () => {
        if (!editData) return;
        exportSourcingTechPackPDF(editData, images);
    };

    // Helper to update deeply nested fields
    const updateField = (path: string, value: any) => {
        if (!editData) return;
        const newData = { ...editData };
        const keys = path.split('.');
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setEditData(newData);
    };

    if (!editData && result) return <div className="p-20 text-center">Loading Workspace...</div>;

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-fade-in font-sans">
            <div className="flex justify-between items-center mb-8 border-b border-cyan-500/20 pb-6">
                <div>
                    <h2 className="text-3xl font-bold brand-font text-white uppercase tracking-tighter glow-text">Tech Pack <span className="text-cyan-400">Generator</span></h2>
                    <p className="text-[10px] text-cyan-500/50 uppercase tracking-[0.4em] font-black">Industrial Sourcing Module v1.1</p>
                </div>
                <Button variant="outline" onClick={onBack}>Exit Workspace</Button>
            </div>

            {!result ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="glass-card border border-cyan-500/20 p-8 rounded-2xl flex flex-col items-center">
                        <h3 className="text-sm font-black uppercase tracking-widest text-cyan-500/60 mb-8 self-start">Input Matrix</h3>

                        <div className="w-full space-y-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-video border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/60 rounded-xl bg-slate-900/40 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden"
                            >
                                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-4 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                </div>
                                <p className="text-xs font-bold text-cyan-100 uppercase tracking-widest text-center px-4">Upload Design, Sketches, or Chat Screenshots</p>
                                <p className="text-[10px] text-cyan-500/40 mt-1 uppercase">Multiple files supported</p>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" multiple />

                            {/* Image Preview Grid */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square border border-cyan-500/20 rounded-lg overflow-hidden bg-slate-950">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                                            >✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-full mt-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500/60 block mb-2">Build Quantity</label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                                        className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg p-3 text-cyan-100 font-mono focus:border-cyan-500/60 outline-none transition-all"
                                        placeholder="Units..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500/60 block mb-2">Reference Source</label>
                                    <div className="bg-slate-950 border border-cyan-500/20 rounded-lg p-3 text-cyan-500/40 font-black uppercase text-[10px] tracking-widest text-center">
                                        Multi-Asset Synthesis
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500/60 block mb-2">Custom Guidelines (Optional)</label>
                                <textarea
                                    value={guidelines}
                                    onChange={(e) => setGuidelines(e.target.value)}
                                    className="w-full bg-slate-950 border border-cyan-500/20 rounded-lg p-3 text-cyan-100 font-mono focus:border-cyan-500/60 outline-none transition-all min-h-[100px] resize-none text-xs"
                                    placeholder="e.g., Use heavyweight 400gsm fleece, extract logo details from the chat screenshot, ensure puff print technique..."
                                />
                            </div>

                            <Button
                                fullWidth
                                disabled={images.length === 0 || loading}
                                onClick={handleGenerate}
                                className="h-14 text-sm tracking-widest font-black uppercase"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 border-2 border-slate-900 border-t-white rounded-full animate-spin" />
                                        Synthesizing Multi-Asset Intelligence...
                                    </div>
                                ) : 'Generate Consolidated Tech Pack'}
                            </Button>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col gap-6">
                        <div className="glass-card border border-cyan-500/20 p-6 rounded-2xl bg-cyan-500/5">
                            <h4 className="text-cyan-400 font-black text-xs uppercase tracking-widest mb-4">Deep Extraction Engine</h4>
                            <ul className="space-y-3">
                                {[
                                    "Multi-Image Context Consolidation",
                                    "Natural Language Conversation Extraction (Chat Analysis)",
                                    "Automated Embellishment & Logo Identification",
                                    "Technique Identification (High-Density, Screen Print, etc.)",
                                    "Dynamic BOM & POM Generation"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-[11px] text-cyan-100/70 leading-relaxed font-mono">
                                        <span className="text-cyan-500 mt-1">▶</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-grow glass-card border border-cyan-500/20 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                            <p className="text-[10px] text-cyan-500 uppercase tracking-[0.2em] mb-4 font-black">Supported Asset Types</p>
                            <div className="grid grid-cols-3 gap-4 w-full opacity-60">
                                <div className="p-4 border border-cyan-500/20 bg-slate-900/40 rounded flex flex-col items-center gap-2">
                                    <span className="text-xl">👕</span>
                                    <span className="text-[8px] font-black uppercase text-cyan-100">Product Photos</span>
                                </div>
                                <div className="p-4 border border-cyan-500/10 bg-slate-900/40 rounded flex flex-col items-center gap-2">
                                    <span className="text-xl">📝</span>
                                    <span className="text-[8px] font-black uppercase text-cyan-100">Draft Sketches</span>
                                </div>
                                <div className="p-4 border border-cyan-500/10 bg-slate-900/40 rounded flex flex-col items-center gap-2">
                                    <span className="text-xl">💬</span>
                                    <span className="text-[8px] font-black uppercase text-cyan-100">Chat Threads</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : editData && (
                <div className="space-y-8 pb-32 animate-slide-up">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {images.slice(0, 5).map((img, i) => (
                                    <div key={i} className="w-10 h-10 border-2 border-slate-900 rounded-lg overflow-hidden ring-1 ring-cyan-500/30">
                                        <img src={img} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {images.length > 5 && <div className="w-10 h-10 bg-slate-900 border-2 border-slate-900 rounded-lg flex items-center justify-center text-[10px] text-cyan-500 font-bold ring-1 ring-cyan-500/30">+{images.length - 5}</div>}
                            </div>
                            <span className="text-[10px] uppercase font-black text-cyan-500/60 tracking-widest pl-2">Assets Optimized</span>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <Button variant="outline" onClick={() => setResult(null)}>New Analysis</Button>
                            <Button variant="outline" onClick={exportToExcel} className="border-cyan-500/30 text-cyan-400">Excel (.xlsx)</Button>
                            <Button onClick={handlePdfExport} className="glow-cyan flex-grow md:flex-grow-0">Download PDF (.pdf)</Button>
                        </div>
                    </div>

                    {/* Google Sheets style Editable UI */}
                    <div className="bg-white text-slate-900 rounded-lg shadow-2xl overflow-hidden font-sans border-t-8 border-cyan-500">
                        {/* Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-200">
                            <div className="col-span-2 p-4 bg-slate-50 border-r border-slate-200 flex flex-col">
                                <label className="text-[8px] text-slate-400 uppercase font-black mb-1">Style Name</label>
                                <input
                                    className="text-lg font-black tracking-tight bg-transparent border-none outline-none focus:ring-1 focus:ring-cyan-500 rounded p-1"
                                    value={editData.productInfo.styleName}
                                    onChange={(e) => updateField('productInfo.styleName', e.target.value)}
                                />
                                <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Consolidated Garment Tech Pack</p>
                            </div>
                            <div className="p-4 border-r border-slate-200">
                                <p className="text-[8px] text-slate-400 uppercase font-black mb-1">Date</p>
                                <input
                                    className="text-xs font-bold bg-transparent border-none outline-none focus:ring-1 focus:ring-cyan-500 rounded p-1 w-full"
                                    value={editData.productInfo.date}
                                    onChange={(e) => updateField('productInfo.date', e.target.value)}
                                />
                            </div>
                            <div className="p-4">
                                <p className="text-[8px] text-slate-400 uppercase font-black mb-1">Project ID</p>
                                <input
                                    className="text-xs font-bold bg-transparent border-none outline-none focus:ring-1 focus:ring-cyan-500 rounded p-1 w-full"
                                    value={editData.productInfo.projectId}
                                    onChange={(e) => updateField('productInfo.projectId', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h4 className="text-[8px] text-slate-400 uppercase font-black mb-1">Product Synthesis Summary</h4>
                            <textarea
                                className="w-full text-[11px] text-slate-700 leading-relaxed italic bg-transparent border-none outline-none focus:ring-1 focus:ring-cyan-500 rounded p-1 resize-none"
                                rows={2}
                                value={editData.productInfo.description}
                                onChange={(e) => updateField('productInfo.description', e.target.value)}
                            />
                        </div>

                        {/* Visuals - Horizontal Carousel */}
                        <div className="p-4 border-b border-slate-200 bg-slate-100/50">
                            <h4 className="text-[8px] text-slate-400 uppercase font-black mb-3 text-center">Reference Image Gallery</h4>
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar justify-center">
                                {images.map((img, i) => (
                                    <div key={i} className="flex-shrink-0 w-32 aspect-[3/4] bg-white border border-slate-200 rounded shadow-sm overflow-hidden p-1">
                                        <img src={img} className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3">
                            {/* Measurements */}
                            <div className="lg:col-span-2 p-0 border-r border-slate-200 border-b lg:border-b-0">
                                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-600">Measurement & Size Chart</h4>
                                    <span className="text-[8px] text-slate-400 italic">Editable Fields</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-[11px]">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="p-3 font-bold border-r border-slate-200">Points of Measure</th>
                                                {editData.measurements?.[0]?.sizes && Object.keys(editData.measurements[0].sizes).map(s => (
                                                    <th key={s} className="p-3 font-bold text-center border-r border-slate-200 last:border-r-0">{s}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {editData.measurements.map((m, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                                                    <td className="p-1 font-medium border-r border-slate-200 bg-slate-50/50">
                                                        <input
                                                            className="w-full bg-transparent border-none outline-none p-2 text-slate-900"
                                                            value={m.pointsOfMeasure}
                                                            onChange={(e) => {
                                                                const newM = [...editData.measurements];
                                                                newM[idx].pointsOfMeasure = e.target.value;
                                                                setEditData({ ...editData, measurements: newM });
                                                            }}
                                                        />
                                                    </td>
                                                    {Object.keys(m.sizes).map((s, i) => (
                                                        <td key={i} className="p-1 text-center border-r border-slate-200 last:border-r-0">
                                                            <input
                                                                className="w-full bg-transparent border-none outline-none p-2 text-center text-slate-900"
                                                                value={m.sizes[s]}
                                                                onChange={(e) => {
                                                                    const newM = [...editData.measurements];
                                                                    newM[idx].sizes[s] = e.target.value;
                                                                    setEditData({ ...editData, measurements: newM });
                                                                }}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* BOM */}
                            <div className="p-0 flex flex-col">
                                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-600">Bill of Materials (BOM)</h4>
                                </div>
                                <div className="flex-grow overflow-x-auto overflow-y-auto max-h-[500px]">
                                    <table className="w-full text-left text-[10px]">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                                <th className="p-2 font-bold border-r border-slate-200">Item</th>
                                                <th className="p-2 font-bold border-r border-slate-200">Color</th>
                                                <th className="p-2 font-bold">Cons.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {editData.bom.map((b, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 last:border-b-0">
                                                    <td className="p-1 border-r border-slate-200">
                                                        <input
                                                            className="w-full bg-transparent border-none outline-none px-1 py-0.5 font-bold text-slate-900"
                                                            value={b.item}
                                                            onChange={(e) => {
                                                                const newB = [...editData.bom];
                                                                newB[idx].item = e.target.value;
                                                                setEditData({ ...editData, bom: newB });
                                                            }}
                                                        />
                                                        <input
                                                            className="w-full bg-transparent border-none outline-none px-1 py-0.5 text-[8px] text-slate-500"
                                                            value={b.description}
                                                            onChange={(e) => {
                                                                const newB = [...editData.bom];
                                                                newB[idx].description = e.target.value;
                                                                setEditData({ ...editData, bom: newB });
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="p-1 border-r border-slate-100 text-[8px]">
                                                        <input
                                                            className="w-full bg-transparent border-none outline-none p-1"
                                                            value={b.colorCode}
                                                            onChange={(e) => {
                                                                const newB = [...editData.bom];
                                                                newB[idx].colorCode = e.target.value;
                                                                setEditData({ ...editData, bom: newB });
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="p-1 font-mono text-cyan-600 font-bold">
                                                        <input
                                                            className="w-full bg-transparent border-none outline-none p-1 text-right"
                                                            value={b.consumption}
                                                            onChange={(e) => {
                                                                const newB = [...editData.bom];
                                                                newB[idx].consumption = e.target.value;
                                                                setEditData({ ...editData, bom: newB });
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-3 bg-cyan-600 text-white flex justify-between items-center text-[10px] font-black uppercase">
                                    <span>Total Capacity</span>
                                    <input
                                        type="number"
                                        className="bg-cyan-700/50 border-none outline-none rounded px-2 w-16 text-right font-bold"
                                        value={editData.productInfo.totalQuantity}
                                        onChange={(e) => updateField('productInfo.totalQuantity', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Embellishments */}
                        <div className="border-t border-slate-200">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-600">Logo & Embellishment Specifications</h4>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-[11px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="p-3 font-bold border-r border-slate-200">Type</th>
                                            <th className="p-3 font-bold border-r border-slate-200 text-center">Technique</th>
                                            <th className="p-3 font-bold border-r border-slate-200 text-center">Placement</th>
                                            <th className="p-3 font-bold border-r border-slate-200 text-center">Size</th>
                                            <th className="p-3 font-bold text-center">Color</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {editData.embellishments.map((e, idx) => (
                                            <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                                                <td className="p-1 font-bold border-r border-slate-200 bg-slate-50/50">
                                                    <input
                                                        className="w-full bg-transparent border-none outline-none p-2 text-slate-900"
                                                        value={e.type}
                                                        onChange={(v) => {
                                                            const newE = [...editData.embellishments];
                                                            newE[idx].type = v.target.value;
                                                            setEditData({ ...editData, embellishments: newE });
                                                        }}
                                                    />
                                                </td>
                                                <td className="p-1 border-r border-slate-200 text-center text-cyan-700 font-bold italic">
                                                    <input
                                                        className="w-full bg-transparent border-none outline-none p-2 text-center"
                                                        value={e.technique}
                                                        onChange={(v) => {
                                                            const newE = [...editData.embellishments];
                                                            newE[idx].technique = v.target.value;
                                                            setEditData({ ...editData, embellishments: newE });
                                                        }}
                                                    />
                                                </td>
                                                <td className="p-1 border-r border-slate-200 text-center uppercase text-[10px]">
                                                    <input
                                                        className="w-full bg-transparent border-none outline-none p-2 text-center"
                                                        value={e.placement}
                                                        onChange={(v) => {
                                                            const newE = [...editData.embellishments];
                                                            newE[idx].placement = v.target.value;
                                                            setEditData({ ...editData, embellishments: newE });
                                                        }}
                                                    />
                                                </td>
                                                <td className="p-1 border-r border-slate-200 text-center font-mono">
                                                    <input
                                                        className="w-full bg-transparent border-none outline-none p-2 text-center"
                                                        value={e.size}
                                                        onChange={(v) => {
                                                            const newE = [...editData.embellishments];
                                                            newE[idx].size = v.target.value;
                                                            setEditData({ ...editData, embellishments: newE });
                                                        }}
                                                    />
                                                </td>
                                                <td className="p-1 text-center text-[10px]">
                                                    <input
                                                        className="w-full bg-transparent border-none outline-none p-2 text-center"
                                                        value={e.color}
                                                        onChange={(v) => {
                                                            const newE = [...editData.embellishments];
                                                            newE[idx].color = v.target.value;
                                                            setEditData({ ...editData, embellishments: newE });
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Notes & QC */}
                        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-slate-200">
                            <div className="p-4 border-r border-slate-200">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Construction Notes</h4>
                                <div className="space-y-2">
                                    {editData.constructionNotes.map((n, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="text-cyan-600 mt-2">◆</span>
                                            <textarea
                                                className="w-full text-[10px] bg-transparent border-none outline-none focus:ring-1 focus:ring-cyan-500 rounded p-1 resize-none"
                                                rows={2}
                                                value={n}
                                                onChange={(e) => {
                                                    const newN = [...editData.constructionNotes];
                                                    newN[i] = e.target.value;
                                                    setEditData({ ...editData, constructionNotes: newN });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 border-r border-slate-200">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">QC Checklist</h4>
                                <div className="space-y-2">
                                    {editData.qcChecklist.map((q, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 border border-slate-300 rounded-sm flex-shrink-0" />
                                            <input
                                                className="w-full text-[10px] bg-transparent border-none outline-none focus:ring-1 focus:ring-cyan-500 rounded p-1"
                                                value={q}
                                                onChange={(e) => {
                                                    const newQ = [...editData.qcChecklist];
                                                    newQ[i] = e.target.value;
                                                    setEditData({ ...editData, qcChecklist: newQ });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Customization</h4>
                                <textarea
                                    className="w-full text-[10px] leading-relaxed italic text-slate-600 bg-transparent border-none outline-none focus:ring-1 focus:ring-cyan-500 rounded p-1"
                                    rows={4}
                                    value={editData.customizationRequests}
                                    onChange={(e) => updateField('customizationRequests', e.target.value)}
                                />
                                <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-end">
                                    <div>
                                        <p className="text-[8px] text-slate-400 uppercase font-bold">Approved By</p>
                                        <div className="w-24 h-6 border-b border-slate-300" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] text-slate-500 font-mono">CP-ANALYZER-SYS</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
