import React from 'react';
import { Lock, ExternalLink, X } from 'lucide-react';
import { openApiKeySelection } from '../services/geminiService';

interface ApiKeyModalProps {
    isVisible: boolean;
    onKeySelected: () => void;
    onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isVisible, onKeySelected, onClose }) => {
    if (!isVisible) return null;

    const handleConnect = async () => {
        try {
            await openApiKeySelection();
            // We assume success if the promise resolves, but in reality we might need to poll checkApiKey
            // For UI flow, we trigger the callback which should re-check
            onKeySelected();
        } catch (e) {
            console.error("Failed to open key selection", e);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-violet-500">
                    <Lock size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Connect Google AI</h2>
                <p className="text-zinc-400 mb-8">
                    To use Veo and Imagen models, you need to connect your Google AI Studio account. This requires a paid project for video generation.
                </p>
                
                <button
                    onClick={handleConnect}
                    className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors mb-4 flex items-center justify-center gap-2"
                >
                    Select API Key
                </button>
                
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-transparent text-zinc-400 font-medium rounded-xl hover:bg-zinc-800 transition-colors mb-4"
                >
                    I'll do this later
                </button>
                
                <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-1"
                >
                    Learn about billing <ExternalLink size={10} />
                </a>
            </div>
        </div>
    );
};

export default ApiKeyModal;