import { GoogleGenAI } from "@google/genai";
import { ModelType, AspectRatio, ImageSize, ChatMessage } from "../types";

// Helper to get the AI client. 
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateVideoVeo = async (
  prompt: string,
  model: string,
  aspectRatio: AspectRatio,
  image?: string, // Base64
  lastFrameImage?: string // Base64
): Promise<string> => {
  const ai = getAIClient();
  
  // Veo 3.1 Fast strictly supports 16:9 and 9:16.
  let apiAspectRatio = '16:9';
  if (aspectRatio === '9:16') {
      apiAspectRatio = '9:16';
  } else if (model.includes('veo')) {
      // Fallback for Veo if user selected a non-supported ratio in UI
      // We will rely on smart crop later, but API call must be valid
      apiAspectRatio = '16:9'; 
  }

  const config: any = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio: apiAspectRatio,
  };

  if (lastFrameImage) {
      config.lastFrame = {
          imageBytes: lastFrameImage,
          mimeType: 'image/png'
      };
  }

  let operation;

  try {
    if (image) {
        operation = await ai.models.generateVideos({
            model: model,
            prompt: prompt,
            image: {
                imageBytes: image,
                mimeType: 'image/png'
            },
            config: config
        });
    } else {
        operation = await ai.models.generateVideos({
            model: model,
            prompt: prompt,
            config: config
        });
    }

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        console.log("Veo status:", operation.metadata?.state);
    }

    if (operation.error) {
        throw new Error(operation.error.message || "Video generation failed");
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No video URI returned");

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) throw new Error("Failed to download generated video");
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Veo Generation Error:", error);
    throw error;
  }
};

export const generateImage = async (
    prompt: string, 
    model: string,
    aspectRatio: AspectRatio = '16:9',
    size: ImageSize = '1K'
): Promise<string> => {
    const ai = getAIClient();
    
    try {
        const config: any = {
            imageConfig: {
                aspectRatio: aspectRatio
            }
        };

        // Size is only for Pro Image model
        if (model === ModelType.IMAGEN_3_PRO) {
            config.imageConfig.imageSize = size;
        }

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [{ text: prompt }] },
            config: config
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part && part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        throw new Error("No image data found in response");

    } catch (error) {
        console.error("Image Generation Error:", error);
        throw error;
    }
};

export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: ModelType.IMAGEN_3_FAST, // Nano Banana for edits
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64Image } },
                    { text: prompt }
                ]
            }
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part && part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        throw new Error("No edited image returned");
    } catch (error) {
        console.error("Image Edit Error:", error);
        throw error;
    }
};

export const chatWithGemini = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    const ai = getAIClient();
    try {
        // Construct basic history for single-turn or multi-turn
        // For simplicity in this demo, we might just send the prompt if it's one-off, 
        // but 'gemini-3-pro-preview' is great for chat.
        const chat = ai.chats.create({
            model: ModelType.GEMINI_PRO,
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.text }]
            }))
        });

        const result = await chat.sendMessage({ message: newMessage });
        return result.text || "No response";
    } catch (error) {
        console.error("Chat Error:", error);
        throw error;
    }
};

export const generateSpeech = async (text: string, voice: string = 'Kore'): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: ModelType.GEMINI_TTS,
            contents: { parts: [{ text: text }] },
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice }
                    }
                }
            }
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part && part.inlineData && part.inlineData.data) {
             // Wrap in a simple wav container or return base64 for audio element
             // The API returns raw PCM usually, but for browser playback we need to decode.
             // However, @google/genai examples show decoding. 
             // For simplicity here, we'll return the base64 and handle decoding in component if possible,
             // or assuming the component can handle it. 
             // Note: The new SDK might return specific format. 
             // We will return the base64 data string.
             return part.inlineData.data;
        }
        throw new Error("No audio data returned");
    } catch (error) {
        console.error("TTS Error:", error);
        throw error;
    }
};

export const transcribeAudio = async (audioBase64: string): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: ModelType.GEMINI_FLASH,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'audio/wav', data: audioBase64 } }, // Assuming wav input
                    { text: "Transcribe this audio." }
                ]
            }
        });
        return response.text || "";
    } catch (error) {
        console.error("Transcription Error:", error);
        throw error;
    }
};

export const analyzeVideo = async (videoUrl: string, prompt: string): Promise<string> => {
    // Note: In a browser environment without a backend, we can't easily fetch the blob and 
    // send >20MB files. We will assume the videoUrl is a blob/object URL we generated.
    // For this demo, we will try to fetch the blob, convert to base64 (if small) and send.
    // Warning: Large videos will crash the browser/request.
    
    const ai = getAIClient();
    try {
        const res = await fetch(videoUrl);
        const blob = await res.blob();
        if (blob.size > 20 * 1024 * 1024) throw new Error("Video too large for inline analysis");
        
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                try {
                    const response = await ai.models.generateContent({
                        model: ModelType.GEMINI_PRO,
                        contents: {
                            parts: [
                                { inlineData: { mimeType: blob.type || 'video/mp4', data: base64 } },
                                { text: prompt }
                            ]
                        }
                    });
                    resolve(response.text || "No analysis generated.");
                } catch (e) {
                    reject(e);
                }
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Video Analysis Error:", error);
        throw error;
    }
};

export const checkApiKey = async (): Promise<boolean> => {
    try {
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
            return await window.aistudio.hasSelectedApiKey();
        }
        return false;
    } catch (e) {
        return false;
    }
}

export const openApiKeySelection = async (): Promise<void> => {
     if (window.aistudio && window.aistudio.openSelectKey) {
            await window.aistudio.openSelectKey();
    }
}