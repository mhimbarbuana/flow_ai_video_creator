import React from 'react';
import { Clip } from '../types';
import { Play, MoreVertical, Plus, Clock } from 'lucide-react';

interface TimelineProps {
    clips: Clip[];
    onSelectClip: (clip: Clip) => void;
    selectedClipId?: string;
}

const Timeline: React.FC<TimelineProps> = ({ clips, onSelectClip, selectedClipId }) => {
    return (
        <div className="h-48 bg-zinc-950 border-t border-zinc-800 flex flex-col shrink-0">
            <div className="h-10 border-b border-zinc-800 px-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Scene Builder</span>
                <div className="flex items-center gap-2 text-zinc-500">
                    <Clock size={14} />
                    <span className="text-xs">00:00 / 00:32</span>
                </div>
            </div>
            
            <div className="flex-1 overflow-x-auto p-4 flex items-center gap-2">
                {/* Empty State / Add Start */}
                {clips.length === 0 && (
                     <div className="h-24 w-40 rounded-lg border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600">
                        <span className="text-sm">Start Scene</span>
                    </div>
                )}

                {clips.map((clip, index) => (
                    <div key={clip.id} className="flex items-center">
                        <div 
                            onClick={() => onSelectClip(clip)}
                            className={`
                                relative h-28 aspect-video rounded-lg overflow-hidden cursor-pointer group border-2 transition-all
                                ${selectedClipId === clip.id ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-zinc-800 hover:border-zinc-600'}
                            `}
                        >
                            {clip.status === 'generating' ? (
                                <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center animate-pulse">
                                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <span className="text-xs text-zinc-400 font-medium">Generating...</span>
                                </div>
                            ) : (
                                <>
                                    {clip.thumbnail ? (
                                         <img src={clip.thumbnail} alt={clip.prompt} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                            <Play size={24} className="text-zinc-600" />
                                        </div>
                                    )}
                                    {clip.type === 'video' && <div className="absolute top-2 right-2 w-4 h-4 rounded bg-black/50 flex items-center justify-center"><Play size={8} className="text-white fill-white"/></div>}
                                </>
                            )}
                            
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[10px] text-white truncate">{clip.prompt}</p>
                            </div>
                        </div>

                        {/* Transition Connector */}
                        {index < clips.length - 1 && (
                            <div className="w-6 h-0.5 bg-zinc-800 mx-1 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-700 hover:border-violet-500 cursor-pointer flex items-center justify-center">
                                    <Plus size={8} className="text-zinc-400" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;