import React, { useRef, useState, useEffect } from 'react';
import { Clip, AspectRatio } from '../types';
import { Play, Pause, Maximize2, SkipBack, SkipForward, Download, Ratio } from 'lucide-react';

interface VideoPlayerProps {
    clip?: Clip;
    aspectRatio?: AspectRatio;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ clip, aspectRatio = '16:9' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setIsPlaying(false);
        setProgress(0);
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [clip]);

    const togglePlay = () => {
        if (!videoRef.current || !clip || clip.status !== 'ready') return;
        
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration || 1;
            setProgress((current / duration) * 100);
        }
    };

    const handleVideoEnd = () => {
        setIsPlaying(false);
    };

    // Calculate container dimensions based on Smart Crop Aspect Ratio
    const getContainerStyle = () => {
        switch (aspectRatio) {
            case '9:16': return { width: 'auto', height: '100%', aspectRatio: '9/16' };
            case '1:1': return { width: 'auto', height: '100%', aspectRatio: '1/1' };
            case '4:3': return { width: 'auto', height: '100%', aspectRatio: '4/3' };
            default: return { width: '100%', height: 'auto', aspectRatio: '16/9' };
        }
    };

    if (!clip) {
        return (
            <div className="flex-1 bg-black flex flex-col items-center justify-center text-zinc-600">
                <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <Play size={32} className="ml-2" />
                </div>
                <p className="font-light tracking-wide">Select a clip or generate a new one</p>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-black relative flex flex-col justify-center items-center overflow-hidden group">
            {/* Background Pattern for BG Removal check */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] opacity-10 pointer-events-none"></div>

            {/* Main Content Container with Smart Crop constraints */}
            <div 
                className="relative bg-zinc-900 shadow-2xl transition-all duration-500 ease-in-out border border-zinc-800 overflow-hidden"
                style={{
                    ...getContainerStyle(),
                    maxWidth: '100%',
                    maxHeight: '100%'
                }}
            >
                {clip.status === 'generating' ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <div className="relative w-24 h-24">
                             <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                             <div className="absolute inset-0 border-4 border-violet-500 rounded-full border-t-transparent animate-spin"></div>
                         </div>
                         <p className="mt-8 text-violet-400 animate-pulse font-medium tracking-widest uppercase text-xs">Processing Generation</p>
                     </div>
                ) : clip.type === 'video' ? (
                    <video
                        ref={videoRef}
                        src={clip.url}
                        className={`w-full h-full object-cover ${clip.isBackgroundRemoved ? 'mix-blend-normal' : ''}`}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleVideoEnd}
                        playsInline
                        loop
                    />
                ) : (
                    <img src={clip.url} alt="Generated" className={`w-full h-full object-cover ${clip.isBackgroundRemoved ? 'object-contain' : ''}`} />
                )}

                {/* Overlay Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                     <div className="flex flex-col gap-2">
                         {/* Progress Bar */}
                         <div className="h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all">
                             <div 
                                className="h-full bg-violet-500" 
                                style={{ width: `${progress}%` }}
                             ></div>
                         </div>
                         
                         <div className="flex items-center justify-between mt-2">
                             <div className="flex items-center gap-4 text-white">
                                 <button className="hover:text-violet-400 transition-colors"><SkipBack size={20} /></button>
                                 <button 
                                    onClick={togglePlay}
                                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                     {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                                 </button>
                                 <button className="hover:text-violet-400 transition-colors"><SkipForward size={20} /></button>
                                 <span className="text-xs font-mono ml-2 text-zinc-400">
                                     {aspectRatio !== '16:9' && <span className="text-accent mr-2 border border-accent/50 px-1 rounded text-[10px]">CROP {aspectRatio}</span>}
                                     00:00 / 00:08
                                 </span>
                             </div>
                             
                             <div className="flex items-center gap-4 text-white/80">
                                 <button className="hover:text-white transition-colors" title="Download">
                                     <Download size={20} />
                                 </button>
                                 <button className="hover:text-white transition-colors">
                                     <Maximize2 size={20} />
                                 </button>
                             </div>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;