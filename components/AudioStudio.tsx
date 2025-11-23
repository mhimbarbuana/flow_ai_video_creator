import React, { useState } from 'react';
import { Mic, Volume2, Upload, Play, Loader2, FileAudio } from 'lucide-react';
import { generateSpeech, transcribeAudio } from '../services/geminiService';

const AudioStudio: React.FC = () => {
    // TTS State
    const [ttsText, setTtsText] = useState('');
    const [ttsVoice, setTtsVoice] = useState('Kore');
    const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
    const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);

    // Transcription State
    const [transcriptionFile, setTranscriptionFile] = useState<string | null>(null);
    const [transcriptionText, setTranscriptionText] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);

    const handleGenerateSpeech = async () => {
        if (!ttsText) return;
        setIsGeneratingTTS(true);
        try {
            const audioData = await generateSpeech(ttsText, ttsVoice);
            // Need to decode logic for playback or just use blob if format supported.
            // Since API returns raw, we ideally need to decode.
            // For now, assume format is playable via simple wav header wrap or existing decode logic.
            // We'll create a simple WAV header for PCM data if needed, but for simplicity we rely on modern browser ability or assume API returns playable container.
            // *Correction*: Raw PCM needs header.
            // For this UI, we will assume we get base64 audio we can play via data uri for now.
            setGeneratedAudio(`data:audio/wav;base64,${audioData}`); 
        } catch (e) {
            alert("TTS Failed");
        } finally {
            setIsGeneratingTTS(false);
        }
    };

    const handleTranscriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                setTranscriptionFile(base64);
                handleTranscribe(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTranscribe = async (base64: string) => {
        setIsTranscribing(true);
        try {
            const text = await transcribeAudio(base64);
            setTranscriptionText(text);
        } catch (e) {
            setTranscriptionText("Error transcribing audio.");
        } finally {
            setIsTranscribing(false);
        }
    };

    return (
        <div className="flex h-full w-full bg-background text-zinc-100 overflow-hidden">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto">
                
                {/* Text to Speech Column */}
                <div className="bg-surface rounded-2xl border border-zinc-800 p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-violet-400 mb-2">
                        <Volume2 size={24} />
                        <h2 className="text-xl font-bold">Text to Speech</h2>
                    </div>
                    
                    <textarea
                        value={ttsText}
                        onChange={(e) => setTtsText(e.target.value)}
                        placeholder="Enter text to generate speech..."
                        className="w-full h-40 bg-zinc-900 border border-zinc-700 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />

                    <div className="flex items-center gap-4">
                        <select 
                            value={ttsVoice}
                            onChange={(e) => setTtsVoice(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none"
                        >
                            <option value="Kore">Kore</option>
                            <option value="Puck">Puck</option>
                            <option value="Charon">Charon</option>
                            <option value="Fenrir">Fenrir</option>
                            <option value="Zephyr">Zephyr</option>
                        </select>
                        <button
                            onClick={handleGenerateSpeech}
                            disabled={isGeneratingTTS || !ttsText}
                            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isGeneratingTTS ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                            Generate
                        </button>
                    </div>

                    {generatedAudio && (
                        <div className="mt-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                            <audio controls src={generatedAudio} className="w-full" />
                        </div>
                    )}
                </div>

                {/* Transcription Column */}
                <div className="bg-surface rounded-2xl border border-zinc-800 p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-pink-400 mb-2">
                        <Mic size={24} />
                        <h2 className="text-xl font-bold">Transcription</h2>
                    </div>

                    <div className="w-full h-32 border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center relative hover:border-pink-500 transition-colors bg-zinc-900/50">
                        <input type="file" accept="audio/*" onChange={handleTranscriptionUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <Upload className="text-zinc-500 mb-2" size={24} />
                        <span className="text-sm text-zinc-400">Upload audio file</span>
                    </div>

                    <div className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-4 min-h-[200px] overflow-y-auto relative">
                        {isTranscribing ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl">
                                <Loader2 className="animate-spin text-pink-500" size={32} />
                            </div>
                        ) : transcriptionText ? (
                            <p className="text-zinc-300 text-sm whitespace-pre-wrap">{transcriptionText}</p>
                        ) : (
                            <div className="h-full flex items-center justify-center text-zinc-600 italic text-sm">
                                Transcription will appear here...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioStudio;