import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PromptInput from './components/PromptInput';
import Timeline from './components/Timeline';
import VideoPlayer from './components/VideoPlayer';
import ApiKeyModal from './components/ApiKeyModal';
import EditorTools from './components/EditorTools';
import ChatInterface from './components/ChatInterface';
import AudioStudio from './components/AudioStudio';
import PromptHistory from './components/PromptHistory';
import { Clip, GenerationMode, ModelType, AspectRatio, ImageSize, HistoryItem } from './types';
import { generateVideoVeo, generateImage, editImage, checkApiKey } from './services/geminiService';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState('editor');
    const [mode, setMode] = useState<GenerationMode>(GenerationMode.TEXT_TO_VIDEO);
    const [clips, setClips] = useState<Clip[]>([]);
    const [selectedClip, setSelectedClip] = useState<Clip | undefined>(undefined);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [apiKeyChecked, setApiKeyChecked] = useState(false);
    
    // History State
    const [history, setHistory] = useState<HistoryItem[]>(() => {
        const saved = localStorage.getItem('prompt_history');
        return saved ? JSON.parse(saved) : [];
    });
    const [prefillPrompt, setPrefillPrompt] = useState<string>('');
    
    // Editor State
    const [editorAspectRatio, setEditorAspectRatio] = useState<AspectRatio>('16:9');
    const [showEditorTools, setShowEditorTools] = useState(false);

    // Persist history
    useEffect(() => {
        localStorage.setItem('prompt_history', JSON.stringify(history));
    }, [history]);

    // Initial API Key Check
    useEffect(() => {
        const verifyKey = async () => {
            const hasKey = await checkApiKey();
            if (!hasKey) {
                setShowKeyModal(true);
            }
            setApiKeyChecked(true);
        };
        verifyKey();
    }, []);

    useEffect(() => {
        if (activeTab === 'tools') {
            setShowEditorTools(true);
        } else {
            setShowEditorTools(false);
        }
    }, [activeTab]);

    const handleGenerate = async (prompt: string, model: string, aspectRatio: AspectRatio, image?: string, lastImage?: string, size?: ImageSize) => {
        // Always re-check key before generating
        const hasKey = await checkApiKey();
        if (!hasKey) {
            setShowKeyModal(true);
            return;
        }
        
        // If we haven't officially 'checked' it yet (edge case), mark as checked
        if (!apiKeyChecked) setApiKeyChecked(true);

        // Add to history
        const historyItem: HistoryItem = {
            id: Date.now().toString(),
            prompt,
            mode,
            timestamp: Date.now(),
            model,
            aspectRatio
        };
        setHistory(prev => [historyItem, ...prev]);

        const newId = Date.now().toString();
        const isImageMode = mode === GenerationMode.IMAGE_GENERATION || mode === GenerationMode.IMAGE_EDIT;
        
        const newClip: Clip = {
            id: newId,
            url: '',
            prompt: prompt,
            type: isImageMode ? 'image' : 'video',
            aspectRatio: aspectRatio,
            status: 'generating'
        };

        setClips(prev => [...prev, newClip]);
        setSelectedClip(newClip);
        setIsGenerating(true);

        try {
            let resultUrl: string;
            
            if (mode === GenerationMode.IMAGE_EDIT && image) {
                 resultUrl = await editImage(image, prompt);
            } else if (mode === GenerationMode.IMAGE_GENERATION) {
                resultUrl = await generateImage(prompt, model, aspectRatio, size);
            } else {
                resultUrl = await generateVideoVeo(prompt, model, aspectRatio, image, lastImage);
            }

            setClips(prev => prev.map(c => {
                if (c.id === newId) {
                    return { ...c, url: resultUrl, thumbnail: resultUrl, status: 'ready' };
                }
                return c;
            }));
            setSelectedClip(prev => prev?.id === newId ? { ...prev, url: resultUrl, thumbnail: resultUrl, status: 'ready' } : prev);

        } catch (error) {
            console.error("Generation failed", error);
            setClips(prev => prev.map(c => c.id === newId ? { ...c, status: 'failed' } : c));
            alert("Generation failed. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReusePrompt = (item: HistoryItem) => {
        setMode(item.mode);
        setPrefillPrompt(item.prompt);
        setActiveTab('editor');
    };

    const handleDeleteHistory = (id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    const handleClearHistory = () => {
        setHistory([]);
    };

    const handleKeySelected = async () => {
        const hasKey = await checkApiKey();
        if (hasKey) {
            setShowKeyModal(false);
            setApiKeyChecked(true);
        }
    };

    const handleUpdateClip = (clipId: string, updates: Partial<Clip>) => {
        setClips(prev => prev.map(c => c.id === clipId ? { ...c, ...updates } : c));
        if (selectedClip?.id === clipId) {
            setSelectedClip(prev => prev ? { ...prev, ...updates } : undefined);
        }
    };

    // Render Logic
    const renderContent = () => {
        switch (activeTab) {
            case 'chat':
                return <ChatInterface />;
            case 'audio':
                return <AudioStudio />;
            case 'history':
                return <PromptHistory 
                    history={history} 
                    onReuse={handleReusePrompt} 
                    onDelete={handleDeleteHistory}
                    onClear={handleClearHistory}
                />;
            case 'projects':
                return <div className="p-8 text-zinc-500 text-center">Projects list coming soon...</div>;
            case 'assets':
                return <div className="p-8 text-zinc-500 text-center">Asset library coming soon...</div>;
            case 'editor':
            case 'tools':
            default:
                return (
                    <div className="flex-1 flex flex-col relative overflow-hidden h-full">
                        <div className="flex-1 flex min-h-0">
                            <div className="flex-1 flex flex-col min-w-0">
                                <VideoPlayer clip={selectedClip} aspectRatio={editorAspectRatio} />
                                <Timeline 
                                    clips={clips} 
                                    onSelectClip={setSelectedClip} 
                                    selectedClipId={selectedClip?.id} 
                                />
                            </div>

                            {showEditorTools && (
                                <EditorTools 
                                    selectedClip={selectedClip} 
                                    onUpdateClip={handleUpdateClip}
                                    onSetAspectRatio={setEditorAspectRatio}
                                    currentAspectRatio={editorAspectRatio}
                                />
                            )}
                        </div>
                        
                        {!showEditorTools && (
                            <PromptInput 
                                mode={mode} 
                                setMode={setMode} 
                                onGenerate={handleGenerate}
                                isGenerating={isGenerating}
                                prefillPrompt={prefillPrompt}
                            />
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden text-zinc-100 font-sans selection:bg-violet-500/30">
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onOpenSettings={() => setShowKeyModal(true)}
            />
            
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-sm font-medium text-zinc-400">Untitled Project</h1>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-500 border border-zinc-700">Auto-saved</span>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-zinc-950"></div>
                            <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-zinc-950"></div>
                        </div>
                        <button 
                            className="bg-white text-black px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-colors"
                            onClick={() => alert("Export feature coming soon")}
                        >
                            Export
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {renderContent()}
                </div>
            </main>

            <ApiKeyModal 
                isVisible={showKeyModal} 
                onKeySelected={handleKeySelected} 
                onClose={() => setShowKeyModal(false)}
            />
        </div>
    );
};

export default App;