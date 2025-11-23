import React, { useState } from 'react';
import { Clip, AspectRatio } from '../types';
import { Scissors, ScanFace, Eraser, Check, Loader2, Ratio, Search, Sparkles } from 'lucide-react';
import { analyzeVideo } from '../services/geminiService';

interface EditorToolsProps {
    selectedClip?: Clip;
    onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
    onSetAspectRatio: (ratio: AspectRatio) => void;
    currentAspectRatio: AspectRatio;
}

const EditorTools: React.FC<EditorToolsProps> = ({ selectedClip, onUpdateClip, onSetAspectRatio, currentAspectRatio }) => {
    const [processingAction, setProcessingAction] = useState<string | null>(null);

    const handleAction = async (action: string) => {
        if (!selectedClip) return;
        setProcessingAction(action);

        if (action === 'remove_bg') {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Sim
            onUpdateClip(selectedClip.id, { isBackgroundRemoved: !selectedClip.isBackgroundRemoved });
        } else if (action === 'shot_detection') {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Sim
            onUpdateClip(selectedClip.id, { detectedShots: [0, 2.5, 5.1, 8] });
        } else if (action === 'analyze') {
             try {
                 const analysis = await analyzeVideo(selectedClip.url, "Analyze this video. Describe the action, mood, and key elements.");
                 onUpdateClip(selectedClip.id, { analysis });
             } catch (e) {
                 alert("Could not analyze video (File might be too large for this demo).");
             }
        }

        setProcessingAction(null);
    };

    if (!selectedClip) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-8 text-center bg-surface border-l border-zinc-800">
                <Scissors size={48} className="mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-zinc-300">AI Editor</h3>
                <p className="text-sm">Select a clip to access smart editing tools.</p>
            </div>
        );
    }

    return (
        <div className="w-80 bg-surface border-l border-zinc-800 flex flex-col h-full shrink-0 overflow-y-auto">
            <div className="p-6 border-b border-zinc-800">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Scissors size={20} className="text-violet-500" />
                    Smart Tools
                </h2>
                <p className="text-xs text-zinc-500 mt-1">AI-powered video processing</p>
            </div>

            <div className="p-6 space-y-8">
                {/* Smart Crop Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-zinc-200 font-medium">
                        <Ratio size={18} className="text-accent" />
                        <h3>Smart Auto-Crop</h3>
                    </div>
                    <p className="text-xs text-zinc-500">Intelligently reframes video for different platforms.</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                        {(['16:9', '9:16', '1:1', '4:3'] as AspectRatio[]).map((ratio) => (
                            <button
                                key={ratio}
                                onClick={() => onSetAspectRatio(ratio)}
                                className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                                    currentAspectRatio === ratio 
                                    ? 'bg-violet-500/20 border-violet-500 text-white' 
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                }`}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Analysis Section */}
                 <div className="space-y-4 pt-6 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-200 font-medium">
                        <Search size={18} className="text-yellow-400" />
                        <h3>Video Understanding</h3>
                    </div>
                    <p className="text-xs text-zinc-500">Analyze scene content using Gemini Pro.</p>
                    <button
                        onClick={() => handleAction('analyze')}
                        disabled={!!processingAction}
                        className="w-full py-2.5 px-4 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-lg text-sm text-white transition-colors flex items-center justify-center gap-2"
                    >
                        {processingAction === 'analyze' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        Analyze Clip
                    </button>
                    {selectedClip.analysis && (
                        <div className="bg-zinc-900 p-3 rounded-lg text-xs text-zinc-300 max-h-32 overflow-y-auto">
                            {selectedClip.analysis}
                        </div>
                    )}
                </div>

                {/* Shot Detection */}
                <div className="space-y-4 pt-6 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-200 font-medium">
                        <ScanFace size={18} className="text-blue-400" />
                        <h3>Shot Detection</h3>
                    </div>
                    
                    <button
                        onClick={() => handleAction('shot_detection')}
                        disabled={!!processingAction}
                        className="w-full py-2.5 px-4 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-lg text-sm text-white transition-colors flex items-center justify-center gap-2"
                    >
                        {processingAction === 'shot_detection' ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : selectedClip.detectedShots ? (
                            <>
                                <Check size={16} className="text-green-500" />
                                <span>Scenes Detected ({selectedClip.detectedShots.length - 1})</span>
                            </>
                        ) : (
                            <span>Detect Scenes</span>
                        )}
                    </button>
                </div>

                {/* Background Removal */}
                <div className="space-y-4 pt-6 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-200 font-medium">
                        <Eraser size={18} className="text-pink-400" />
                        <h3>Background Remover</h3>
                    </div>
                    
                    <button
                        onClick={() => handleAction('remove_bg')}
                        disabled={!!processingAction}
                        className={`w-full py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 border ${
                            selectedClip.isBackgroundRemoved
                            ? 'bg-pink-500/10 border-pink-500 text-pink-400 hover:bg-pink-500/20'
                            : 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800'
                        }`}
                    >
                        {processingAction === 'remove_bg' ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : selectedClip.isBackgroundRemoved ? (
                            <>
                                <Eraser size={16} />
                                <span>Restore Background</span>
                            </>
                        ) : (
                            <span>Remove Background</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditorTools;