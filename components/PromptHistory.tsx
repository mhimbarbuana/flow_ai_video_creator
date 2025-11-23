import React, { useState, useMemo } from 'react';
import { HistoryItem, GenerationMode } from '../types';
import { Search, Clock, Trash2, ArrowUpRight, Copy } from 'lucide-react';

interface PromptHistoryProps {
    history: HistoryItem[];
    onReuse: (item: HistoryItem) => void;
    onDelete: (id: string) => void;
    onClear: () => void;
}

const PromptHistory: React.FC<PromptHistoryProps> = ({ history, onReuse, onDelete, onClear }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredHistory = useMemo(() => {
        return history.filter(item => 
            item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.mode.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [history, searchQuery]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col h-full bg-background text-zinc-100">
            <div className="p-6 border-b border-zinc-800 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="text-violet-500" />
                            Prompt History
                        </h2>
                        <p className="text-sm text-zinc-500 mt-1">
                            Browse and reuse your previous generations
                        </p>
                    </div>
                    {history.length > 0 && (
                        <button 
                            onClick={onClear}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                        >
                            <Trash2 size={14} /> Clear All
                        </button>
                    )}
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input 
                        type="text"
                        placeholder="Search prompts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder-zinc-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                        <Clock size={48} className="mb-4 opacity-20" />
                        <p>No history found</p>
                        {history.length > 0 && <p className="text-xs mt-1">Try a different search term</p>}
                    </div>
                ) : (
                    filteredHistory.map((item) => (
                        <div 
                            key={item.id}
                            className="group bg-surface border border-zinc-800 hover:border-violet-500/50 rounded-xl p-4 transition-all"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                                        {item.mode}
                                    </span>
                                    <span className="text-[10px] text-zinc-600">
                                        {formatDate(item.timestamp)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => onDelete(item.id)}
                                        className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded text-zinc-500 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(item.prompt);
                                        }}
                                        className="p-1.5 hover:bg-zinc-800 hover:text-white rounded text-zinc-500 transition-colors"
                                        title="Copy Text"
                                    >
                                        <Copy size={14} />
                                    </button>
                                    <button 
                                        onClick={() => onReuse(item)}
                                        className="p-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded transition-colors"
                                        title="Reuse Prompt"
                                    >
                                        <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed font-light line-clamp-3">
                                {item.prompt}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
                                <span>Model: {item.model}</span>
                                <span>•</span>
                                <span>Ratio: {item.aspectRatio}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PromptHistory;