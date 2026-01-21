
import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Button } from './Button';
import { editGarmentWithAI } from '../services/geminiService';

interface DesignStudioProps {
    originalImage: string; // Base64 or URL
    onClose: () => void;
    onGeneration?: (count: number) => Promise<void>;
}

export const DesignStudio: React.FC<DesignStudioProps> = ({ originalImage, onClose, onGeneration }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const [activeTool, setActiveTool] = useState<'select' | 'wand' | 'brush' | 'color'>('select');
    const [loading, setLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(0);
    const [brightness, setBrightness] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [maskPath, setMaskPath] = useState<fabric.Object | null>(null);

    // Helper to scale image to canvas
    const fitImageToCanvas = (img: fabric.Image, canvas: fabric.Canvas) => {
        const scale = Math.min(
            (canvas.width! * 0.98) / img.width!,
            (canvas.height! * 0.98) / img.height!
        );
        img.set({
            scaleX: scale,
            scaleY: scale,
            left: canvas.width! / 2,
            top: canvas.height! / 2,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            name: 'baseImage'
        });
    };

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current || fabricCanvas) return;

        const container = canvasRef.current.parentElement;
        const width = container?.clientWidth || 800;
        const height = container?.clientHeight || 600;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: width,
            height: height,
            backgroundColor: '#1a1a1a',
            selection: true,
            isDrawingMode: false
        });

        setFabricCanvas(canvas);

        fabric.Image.fromURL(originalImage, (img) => {
            fitImageToCanvas(img, canvas);
            canvas.add(img);
            canvas.sendToBack(img);
            canvas.renderAll();
        });

        // HANDLE CLICK FOR MAGIC WAND
        canvas.on('mouse:down', (options) => {
            if (activeTool !== 'wand' || !options.pointer) return;
            performMagicWand(options.pointer.x, options.pointer.y, canvas);
        });

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const active = canvas.getActiveObject();
                if (active && active.name !== 'baseImage') {
                    canvas.remove(active);
                    if (active === maskPath) setMaskPath(null);
                }
            }
        };
        window.addEventListener('keydown', handleKey);

        return () => {
            canvas.dispose();
            window.removeEventListener('keydown', handleKey);
        };
    }, [activeTool]); // Re-bind on tool change to handle wand clicks effectively

    // MAGIC WAND LOGIC (Pixel-based selection)
    const performMagicWand = (x: number, y: number, canvas: fabric.Canvas) => {
        const ctx = canvas.getContext();
        const imageData = ctx.getImageData(0, 0, canvas.width || 800, canvas.height || 600);
        const data = imageData.data;

        const targetColor = getPixelColor(x, y, data, canvas.width!);
        const visited = new Uint8Array(canvas.width! * canvas.height!);
        const selectionMask = new Uint8Array(canvas.width! * canvas.height!);
        const stack = [[Math.round(x), Math.round(y)]];
        const tolerance = 30;

        while (stack.length > 0) {
            const [cx, cy] = stack.pop()!;
            const idx = (cy * canvas.width! + cx);
            if (cx < 0 || cx >= canvas.width! || cy < 0 || cy >= canvas.height! || visited[idx]) continue;

            visited[idx] = 1;
            const color = getPixelColor(cx, cy, data, canvas.width!);

            if (colorDelta(targetColor, color) < tolerance) {
                selectionMask[idx] = 255;
                stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
            }
        }

        // Create a temporary canvas to generate a path/image from the mask
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width!;
        tempCanvas.height = canvas.height!;
        const tctx = tempCanvas.getContext('2d')!;
        const maskImageData = tctx.createImageData(canvas.width!, canvas.height!);
        for (let i = 0; i < selectionMask.length; i++) {
            const val = selectionMask[i];
            const idx = i * 4;
            maskImageData.data[idx] = 255;
            maskImageData.data[idx + 1] = 0;
            maskImageData.data[idx + 2] = 0;
            maskImageData.data[idx + 3] = val ? 100 : 0;
        }
        tctx.putImageData(maskImageData, 0, 0);

        fabric.Image.fromURL(tempCanvas.toDataURL(), (maskImg) => {
            if (maskPath) canvas.remove(maskPath);
            maskImg.set({ selectable: true, name: 'maskArea' });
            canvas.add(maskImg);
            setMaskPath(maskImg);
            setActiveTool('select');
        });
    };

    const getPixelColor = (x: number, y: number, data: Uint8ClampedArray, width: number) => {
        const idx = (Math.round(y) * width + Math.round(x)) * 4;
        return [data[idx], data[idx + 1], data[idx + 2]];
    };

    const colorDelta = (c1: number[], c2: number[]) => {
        return Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2) + Math.pow(c1[2] - c2[2], 2));
    };

    // Update Drawing Mode
    useEffect(() => {
        if (!fabricCanvas) return;
        if (activeTool === 'brush') {
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.width = 30;
            fabricCanvas.freeDrawingBrush.color = 'rgba(255, 0, 0, 0.5)';
        } else {
            fabricCanvas.isDrawingMode = false;
        }
    }, [activeTool, fabricCanvas]);

    useEffect(() => {
        if (!fabricCanvas) return;
        const onPathCreated = (e: any) => {
            if (activeTool === 'brush') {
                const path = e.path as fabric.Path;
                path.set({ selectable: true, fill: 'rgba(255, 0, 0, 0.3)', stroke: 'red', strokeWidth: 2, name: 'maskArea' });
                setMaskPath(path);
                setActiveTool('select');
            }
        };
        fabricCanvas.on('path:created', onPathCreated);
        return () => fabricCanvas.off('path:created', onPathCreated);
    }, [fabricCanvas, activeTool]);

    // AI INPAINTING LOGIC
    const handleAiEdit = async () => {
        if (!fabricCanvas || !aiPrompt) return;
        setLoading(true);
        try {
            const baseObj = fabricCanvas.getObjects().find(o => o.name === 'baseImage') as fabric.Image;

            // Generate Mask
            let maskBase64 = "";
            if (maskPath) {
                const staticCanvas = new fabric.StaticCanvas(null, { width: fabricCanvas.getWidth(), height: fabricCanvas.getHeight(), backgroundColor: 'black' });
                const tempMask = fabric.util.object.clone(maskPath);
                tempMask.set({ fill: 'white', stroke: 'white', opacity: 1 });
                staticCanvas.add(tempMask);
                staticCanvas.renderAll();
                maskBase64 = staticCanvas.toDataURL({ format: 'png' });
            } else {
                // If no mask, send a full white mask (Global modification)
                const staticCanvas = new fabric.StaticCanvas(null, { width: fabricCanvas.getWidth(), height: fabricCanvas.getHeight(), backgroundColor: 'white' });
                maskBase64 = staticCanvas.toDataURL({ format: 'png' });
            }

            const result = await editGarmentWithAI(baseObj.toDataURL({ format: 'png' }), maskBase64, aiPrompt);

            fabric.Image.fromURL(`data:image/png;base64,${result}`, (img) => {
                const oldBase = fabricCanvas.getObjects().find(o => o.name === 'baseImage');
                if (oldBase) fabricCanvas.remove(oldBase);

                fitImageToCanvas(img, fabricCanvas);
                fabricCanvas.add(img);
                fabricCanvas.sendToBack(img);

                if (maskPath) fabricCanvas.remove(maskPath);
                setMaskPath(null);
                setAiPrompt("");
                fabricCanvas.renderAll();

                if (onGeneration) {
                    onGeneration(1);
                }
            });
        } catch (e: any) {
            alert("AI Edit Failed: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    // COLOR ADJUSTMENT LOGIC
    useEffect(() => {
        const active = fabricCanvas?.getActiveObject();
        if (active && active.type === 'image') {
            const hueFilter = new fabric.Image.filters.HueRotation({ rotation: hue / 180 });
            const satFilter = new fabric.Image.filters.Saturation({ saturation: saturation / 100 });
            const brightFilter = new fabric.Image.filters.Brightness({ brightness: brightness / 100 });
            (active as fabric.Image).filters = [hueFilter, satFilter, brightFilter];
            (active as fabric.Image).applyFilters();
            fabricCanvas?.renderAll();
        }
    }, [hue, saturation, brightness]);

    const handleAddText = () => {
        if (!fabricCanvas) return;
        const text = new fabric.IText('Your Text', { left: 100, top: 100, fontFamily: 'Inter', fill: 'white', fontSize: 40 });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
    };

    const handleAddLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && fabricCanvas) {
            const reader = new FileReader();
            reader.onload = (f) => {
                fabric.Image.fromURL(f.target?.result as string, (img) => {
                    img.scaleToWidth(150);
                    img.set({ left: 150, top: 150 });
                    fabricCanvas.add(img);
                    fabricCanvas.setActiveObject(img);
                });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#1a1a1a] flex flex-col text-white font-sans overflow-hidden">
            <div className="h-16 border-b border-white/10 flex items-center px-4 bg-black gap-4">
                <h2 className="font-bold brand-font text-xl whitespace-nowrap">STUDIO <span className="text-purple-500 italic">V2</span></h2>

                <div className="flex bg-neutral-800 rounded-lg p-1">
                    <button onClick={() => setActiveTool('select')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTool === 'select' ? 'bg-purple-600 text-white' : 'hover:text-white text-gray-400'}`}>
                        Cursor
                    </button>
                    <button onClick={() => setActiveTool('wand')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTool === 'wand' ? 'bg-purple-600 text-white' : 'hover:text-white text-gray-400'}`}>
                        Wand
                    </button>
                    <button onClick={() => setActiveTool('brush')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTool === 'brush' ? 'bg-purple-600 text-white' : 'hover:text-white text-gray-400'}`}>
                        Brush
                    </button>
                </div>

                <div className="flex-1 max-w-2xl flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Describe the change (e.g., 'Make it silk', 'Change color to red')..."
                        className="flex-1 bg-neutral-800 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        disabled={loading}
                    />
                    <Button variant="primary" size="sm" onClick={handleAiEdit} disabled={!aiPrompt || loading}>
                        {loading ? 'AI Processing...' : 'AI Modify'}
                    </Button>
                </div>

                <div className="ml-auto flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={() => {
                        const dataUrl = fabricCanvas?.toDataURL({ format: 'png', quality: 1 });
                        if (dataUrl) {
                            const link = document.createElement('a');
                            link.style.display = 'none';
                            link.href = dataUrl;
                            link.download = 'ai_studio_design.png';
                            document.body.appendChild(link);
                            link.click();
                            setTimeout(() => document.body.removeChild(link), 100);
                        }
                    }}>Export</Button>
                    <button onClick={onClose} className="text-gray-400 hover:text-white px-2">✕</button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-16 lg:w-20 bg-black/40 border-r border-white/10 flex flex-col items-center py-6 gap-6">
                    <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors group relative">
                        <span className="text-xl">🖼️</span>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleAddLogo} accept="image/*" />
                    <button onClick={handleAddText} className="w-10 h-10 flex items-center justify-center bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors group relative">
                        <span className="text-xl font-serif">T</span>
                    </button>
                </div>

                <div className="flex-1 relative bg-neutral-900 overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full p-4 overflow-hidden">
                        <canvas ref={canvasRef} />
                    </div>
                    {loading && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="font-bold text-lg">AI is remastering the product...</p>
                        </div>
                    )}
                </div>

                <div className="w-72 bg-black/40 border-l border-white/10 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10 uppercase text-[10px] font-bold tracking-widest text-gray-500">Properties</div>
                    <div className="p-6 flex flex-col gap-8 flex-1 overflow-y-auto">
                        <div className="flex flex-col gap-6">
                            <h3 className="text-xs font-bold uppercase tracking-wide">Adjustments</h3>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-gray-400">Hue {hue}°</label>
                                <input type="range" min="-180" max="180" value={hue} onChange={(e) => setHue(parseInt(e.target.value))} className="w-full accent-purple-500" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-gray-400">Saturation {saturation}%</label>
                                <input type="range" min="-100" max="100" value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))} className="w-full accent-purple-500" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs text-gray-400">Brightness {brightness}%</label>
                                <input type="range" min="-100" max="100" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full accent-purple-500" />
                            </div>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-xs leading-relaxed text-purple-200">
                            <p className="font-bold mb-2 text-purple-400">Pro Tips:</p>
                            <ul className="list-disc pl-4 space-y-2">
                                <li><strong>Magic Wand</strong>: Click any panel to select it instantly.</li>
                                <li><strong>Global Prompt</strong>: No selection? AI modifies the whole image.</li>
                                <li><strong>Scaling</strong>: Image stays full and centered after every edit.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
