export enum GenerationMode {
  TEXT_TO_VIDEO = 'Text to Video',
  FRAMES_TO_VIDEO = 'Frames to Video',
  INGREDIENTS_TO_VIDEO = 'Ingredients to Video',
  IMAGE_GENERATION = 'Create Image',
  IMAGE_EDIT = 'Edit Image',
  STYLE_TRANSFER = 'Style Transfer',
}

export interface Ingredient {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
}

export interface Clip {
  id: string;
  url: string;
  thumbnail?: string;
  prompt: string;
  duration?: number;
  type: 'video' | 'image' | 'audio';
  aspectRatio: string;
  status: 'generating' | 'ready' | 'failed';
  // New properties for editing
  isBackgroundRemoved?: boolean;
  detectedShots?: number[];
  analysis?: string;
}

export interface Project {
  id: string;
  name: string;
  clips: Clip[];
  lastModified: Date;
}

export enum ModelType {
  VEO_2_FAST = 'veo-2-fast', 
  VEO_3_FAST = 'veo-3.1-fast-generate-preview',
  VEO_3_QUALITY = 'veo-3.1-generate-preview',
  IMAGEN_3_FAST = 'gemini-2.5-flash-image', // Nano Banana
  IMAGEN_3_PRO = 'gemini-3-pro-image-preview', // Nano Banana Pro
  GEMINI_FLASH_LITE = 'gemini-2.5-flash-lite',
  GEMINI_FLASH = 'gemini-2.5-flash',
  GEMINI_PRO = 'gemini-3-pro-preview',
  GEMINI_TTS = 'gemini-2.5-flash-preview-tts'
}

// Global augmentation for AI Studio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '2:3' | '3:2' | '21:9';
export type ImageSize = '1K' | '2K' | '4K';

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export const ARTISTIC_STYLES = [
  { id: 'none', label: 'No Filter', prompt: '' },
  { id: 'anime', label: 'Anime Style', prompt: 'in the style of 90s anime, vibrant colors, cel shaded' },
  { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'neon lights, futuristic, dark atmosphere, high contrast, cyberpunk aesthetic' },
  { id: 'watercolor', label: 'Watercolor', prompt: 'soft watercolor painting style, artistic, bleeding colors, textured paper' },
  { id: 'claymation', label: 'Claymation', prompt: 'stop motion clay animation style, plasticine texture, studio lighting' },
  { id: 'noir', label: 'Film Noir', prompt: 'black and white film noir style, dramatic shadows, grain, vintage cinematic' },
  { id: 'vangogh', label: 'Van Gogh', prompt: 'oil painting style of Starry Night by Van Gogh, swirling brushstrokes, impasto' },
];