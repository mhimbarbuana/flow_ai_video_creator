import React, { useState, useRef, useEffect } from 'react';
import { GenerationMode, ModelType, ARTISTIC_STYLES, AspectRatio, ImageSize } from '../types';
import { Wand2, ImagePlus, Sparkles, Loader2, Palette, Video, Ratio, Edit, Box } from 'lucide-react';

interface PromptInputProps {
    mode: GenerationMode;
    setMode: (mode: GenerationMode) => void;
    onGenerate: (prompt: string, model: string, aspectRatio: AspectRatio, image?: string, lastImage?: string, size?: ImageSize) => void;
    isGenerating: boolean;
    prefillPrompt?: string; // New prop for history reuse
}

const PromptInput: React.FC<PromptInputProps> = ({ mode, setMode, onGenerate, isGenerating, prefillPrompt }) => {
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState<string>(ModelType.VEO_3_FAST);
    const [selectedStyle, setSelectedStyle] = useState<string>('none');
    const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('16:9');
    const [selectedSize, setSelectedSize] = useState<ImageSize>('1K');
    
    // For Frames/Ingredients/Style Transfer/Edit
    const [startImage, setStartImage] = useState<string | null>(null); 
    const [styleReferenceImage, setStyleReferenceImage] = useState<string | null>(null); 
    
    const fileInputRefStart = useRef<HTMLInputElement>(null);
    const fileInputRefStyle = useRef<HTMLInputElement>(null);

    // Populate prompt when prefillPrompt changes
    useEffect(() => {
        if (prefillPrompt) {
            setPrompt(prefillPrompt);
        }
    }, [prefillPrompt]);

    // Reset settings when mode changes
    useEffect(() => {
        if (mode === GenerationMode.IMAGE_GENERATION) {
            setSelectedModel(ModelType.IMAGEN_3_FAST);
            setSelectedAspectRatio('1:1');
        } else if (mode === GenerationMode.IMAGE_EDIT) {
             setSelectedModel(ModelType.IMAGEN_3_FAST);
        } else {
            setSelectedModel(ModelType.VEO_3_FAST);
            setSelectedAspectRatio('16:9');
        }
    }, [mode]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'start' | 'style') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                const rawBase64 = base64.split(',')[1];
                if (target === 'start') setStartImage(rawBase64);
                else setStyleReferenceImage(rawBase64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateClick = () => {
        let finalPrompt = prompt;

        // Append style to prompt if one is selected
        const styleObj = ARTISTIC_STYLES.find(s => s.id === selectedStyle);
        if (styleObj && styleObj.prompt) {
            finalPrompt = `${finalPrompt}, ${styleObj.prompt}`;
        }

        // Validate Style Transfer / Editing
        if ((mode === GenerationMode.STYLE_TRANSFER || mode === GenerationMode.IMAGE_EDIT) && !startImage) {
            alert("Please upload an image to proceed.");
            return;
        }

        if (!finalPrompt.trim() && mode === GenerationMode.TEXT_TO_VIDEO) return;
        
        onGenerate(
            finalPrompt, 
            selectedModel, 
            selectedAspectRatio,
            startImage || undefined,
            (mode === GenerationMode.FRAMES_TO_VIDEO || mode === GenerationMode.STYLE_TRANSFER) ? styleReferenceImage || undefined : undefined,
            selectedSize
        );
    };

    const getModeIcon = (m: GenerationMode) => {
        switch(m) {
            case GenerationMode.STYLE_TRANSFER: return <Palette size={14} />;
            case GenerationMode.IMAGE_GENERATION: return <ImagePlus size={14} />;
            case GenerationMode.IMAGE_EDIT: return <Edit size={14} />;
            default: return <Video size={14} />;
        }
    };

    // Filter available Aspect Ratios based on model capabilities
    const availableRatios: AspectRatio[] = selectedModel.includes('veo') 
        ? ['16:9', '9:16'] 
        : ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'];

    return (
        <div className="w-full bg-surface border-t border-zinc-800 p-4 md:p-6 flex flex-col gap-4 shadow-2xl z-10">
            {/* Mode Selection Tabs */}
            <div className="flex overflow-x-auto pb-1 gap-1">
                {[GenerationMode.TEXT_TO_VIDEO, GenerationMode.FRAMES_TO_VIDEO, GenerationMode.IMAGE_GENERATION, GenerationMode.IMAGE_EDIT, GenerationMode.STYLE_TRANSFER].map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                            mode === m 
                            ? 'bg-zinc-700 text-white shadow-sm' 
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                    >
                        {getModeIcon(m)}
                        {m}
                    </button>
                ))}
            </div>

            {/* Visual Inputs Area */}
            <div className="flex flex-col md:flex-row gap-4">
                
                {/* Upload Zones */}
                {(mode !== GenerationMode.TEXT_TO_VIDEO && mode !== GenerationMode.IMAGE_GENERATION) && (
                    <div className="flex gap-2 shrink-0 overflow-x-auto pb-2 md:pb-0">
                        {/* Primary Input */}
                        <div 
                            className="w-32 h-32 bg-zinc-900 border border-zinc-700 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 transition-colors relative overflow-hidden group"
                            onClick={() => fileInputRefStart.current?.click()}
                        >
                            <input ref={fileInputRefStart} type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'start')} />
                            {startImage ? (
                                <img src={`data:image/png;base64,${startImage}`} alt="Start" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <ImagePlus className="text-zinc-500 mb-2 group-hover:text-violet-400" />
                                    <span className="text-xs text-zinc-500 font-medium text-center px-2">
                                        {mode === GenerationMode.STYLE_TRANSFER || mode === GenerationMode.IMAGE_EDIT ? 'Upload Image' : 'Start Frame'}
                                    </span>
                                </>
                            )}
                             {startImage && <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-xs text-white">Change</div>}
                        </div>

                        {/* Secondary Input */}
                        {(mode === GenerationMode.FRAMES_TO_VIDEO || mode === GenerationMode.STYLE_TRANSFER) && (
                            <div 
                                className="w-32 h-32 bg-zinc-900 border border-zinc-700 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 transition-colors relative overflow-hidden group"
                                onClick={() => fileInputRefStyle.current?.click()}
                            >
                                <input ref={fileInputRefStyle} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'style')} />
                                {styleReferenceImage ? (
                                    <img src={`data:image/png;base64,${styleReferenceImage}`} alt="End" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Palette className="text-zinc-500 mb-2 group-hover:text-pink-400" />
                                        <span className="text-xs text-zinc-500 font-medium text-center px-2">
                                            {mode === GenerationMode.STYLE_TRANSFER ? 'Style Ref (Img)' : 'End Frame'}
                                        </span>
                                    </>
                                )}
                                {styleReferenceImage && <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-xs text-white">Change</div>}
                            </div>
                        )}
                    </div>
                )}

                {/* Text Prompt & Controls */}
                <div className="flex-1 flex flex-col gap-3">
                    <div className="relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={
                                mode === GenerationMode.IMAGE_EDIT 
                                ? "What should change? (e.g., 'Add a retro filter', 'Remove the person')"
                                : mode === GenerationMode.STYLE_TRANSFER 
                                ? "Describe style (e.g., 'Oil painting')"
                                : mode === GenerationMode.IMAGE_GENERATION 
                                ? "Describe the image..."
                                : "Describe the video scene..."
                            }
                            className="w-full h-32 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-light"
                        />
                        
                        {/* Settings Bar inside Textarea */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-2 flex-wrap justify-end">
                             {/* Aspect Ratio Selector */}
                             {mode !== GenerationMode.IMAGE_EDIT && (
                                <div className="flex items-center gap-1 bg-zinc-800 rounded-lg border border-zinc-700 px-2 py-1">
                                    <Ratio size={12} className="text-zinc-400" />
                                    <select 
                                        value={selectedAspectRatio}
                                        onChange={(e) => setSelectedAspectRatio(e.target.value as AspectRatio)}
                                        className="bg-transparent text-xs text-zinc-300 focus:outline-none appearance-none text-center cursor-pointer"
                                    >
                                        {availableRatios.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                             )}

                             {/* Image Size Selector (Only for Pro Image) */}
                             {selectedModel === ModelType.IMAGEN_3_PRO && (
                                <div className="flex items-center gap-1 bg-zinc-800 rounded-lg border border-zinc-700 px-2 py-1">
                                    <Box size={12} className="text-zinc-400" />
                                    <select 
                                        value={selectedSize}
                                        onChange={(e) => setSelectedSize(e.target.value as ImageSize)}
                                        className="bg-transparent text-xs text-zinc-300 focus:outline-none appearance-none text-center cursor-pointer"
                                    >
                                        <option value="1K">1K</option>
                                        <option value="2K">2K</option>
                                        <option value="4K">4K</option>
                                    </select>
                                </div>
                             )}

                             {/* Style Preset Selector */}
                             {mode !== GenerationMode.IMAGE_EDIT && (
                                <select 
                                    value={selectedStyle}
                                    onChange={(e) => setSelectedStyle(e.target.value)}
                                    className="bg-zinc-800 text-xs text-zinc-300 py-1 px-2 rounded-lg border border-zinc-700 focus:outline-none max-w-[120px]"
                                >
                                    <option value="" disabled>Artistic Style</option>
                                    {ARTISTIC_STYLES.map(s => (
                                        <option key={s.id} value={s.id}>{s.label}</option>
                                    ))}
                                </select>
                             )}

                             {/* Model Selector */}
                             <select 
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="bg-zinc-800 text-xs text-zinc-300 py-1 px-2 rounded-lg border border-zinc-700 focus:outline-none"
                            >
                                {mode === GenerationMode.IMAGE_GENERATION || mode === GenerationMode.IMAGE_EDIT ? (
                                    <>
                                        <option value={ModelType.IMAGEN_3_FAST}>Nano Banana (Fast)</option>
                                        {mode !== GenerationMode.IMAGE_EDIT && <option value={ModelType.IMAGEN_3_PRO}>Nano Banana Pro (Quality)</option>}
                                    </>
                                ) : (
                                    <>
                                        <option value={ModelType.VEO_3_FAST}>Veo 3.1 (Fast)</option>
                                        <option value={ModelType.VEO_3_QUALITY}>Veo 3.1 (Quality)</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-xs text-zinc-500 flex gap-2">
                            <span className="flex items-center gap-1"><Sparkles size={12} className="text-yellow-500"/> AI Enhanced</span>
                        </div>
                        <button
                            onClick={handleGenerateClick}
                            disabled={isGenerating || (!prompt && mode === GenerationMode.TEXT_TO_VIDEO)}
                            className={`
                                flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all
                                ${isGenerating
                                    ? 'bg-zinc-800 cursor-not-allowed text-zinc-500' 
                                    : 'bg-gradient-to-r from-violet-600 to-pink-600 hover:shadow-lg hover:shadow-violet-500/25 active:scale-95'
                                }
                            `}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Wand2 size={18} />
                                    <span>
                                        {mode === GenerationMode.STYLE_TRANSFER ? 'Apply Style' : 
                                         mode === GenerationMode.IMAGE_EDIT ? 'Edit Image' : 'Generate'}
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptInput;