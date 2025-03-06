import OpenAI from 'openai';
import { supabase } from './supabase';
import { captureAndStoreImage } from './imageUtils';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Fallback images for different themes
const FALLBACK_IMAGES = {
  adventure: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1024',
  safari: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1024',
  friendship: 'https://images.unsplash.com/photo-1591035897819-f4bdf739f446?q=80&w=1024',
  kindness: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1024',
  default: 'https://images.unsplash.com/photo-1606819717115-9159c900370b?q=80&w=1024'
};

interface ImageGenerationOptions {
  storyId?: string;
  theme?: string;
  childPhotoUrl?: string;
  forceNew?: boolean;
}

interface StoryParagraph {
  text: string;
  page_number: number;
  image_url?: string;
}

export const generateImage = async (
  prompt: string,
  options: ImageGenerationOptions = {}
): Promise<string> => {
  const { storyId, theme, childPhotoUrl, forceNew } = options;

  // If storyId is provided and not forcing new, try to fetch existing image
  if (storyId && !forceNew) {
    const { data: existingStory } = await supabase
      .from('stories')
      .select('paragraphs')
      .eq('id', storyId)
      .single();

    if (existingStory?.paragraphs) {
      const paragraph = existingStory.paragraphs.find(
        (p: StoryParagraph) => p.text === prompt
      );
      if (paragraph?.image_url) {
        return paragraph.image_url;
      }
    }
  }

  try {
    let enhancedPrompt = `Create a child-friendly, storybook-style illustration that captures the essence of ${theme || 'adventure'}: ${prompt}`;

    if (childPhotoUrl) {
      enhancedPrompt += ` The illustration should feature the child from the reference photo in the scene.`;
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    const imageUrl = response.data[0].url;

    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    // Capture and store the generated image
    const storedImageUrl = await captureAndStoreImage(imageUrl);

    // If we have a storyId, update the story's paragraphs with the new image
    if (storyId) {
      const { data: currentStory } = await supabase
        .from('stories')
        .select('paragraphs')
        .eq('id', storyId)
        .single();

      if (currentStory) {
        const updatedParagraphs = currentStory.paragraphs.map((p: StoryParagraph) => {
          if (p.text === prompt) {
            return { ...p, image_url: storedImageUrl };
          }
          return p;
        });

        await supabase
          .from('stories')
          .update({ paragraphs: updatedParagraphs })
          .eq('id', storyId);
      }
    }

    return storedImageUrl;
  } catch (error: any) {
    console.error('Error generating image:', error);
    
    // Only use fallback if it's a billing or rate limit error
    if (error?.error?.code === 'billing_hard_limit_reached' || 
        error?.error?.code === 'rate_limit_exceeded') {
      const fallbackKey = theme?.toLowerCase() as keyof typeof FALLBACK_IMAGES;
      const fallbackUrl = FALLBACK_IMAGES[fallbackKey] || FALLBACK_IMAGES.default;
      
      // Update the story with the fallback image if we have a storyId
      if (storyId) {
        const { data: currentStory } = await supabase
          .from('stories')
          .select('paragraphs')
          .eq('id', storyId)
          .single();

        if (currentStory) {
          const updatedParagraphs = currentStory.paragraphs.map((p: StoryParagraph) => {
            if (p.text === prompt) {
              return { ...p, image_url: fallbackUrl };
            }
            return p;
          });

          await supabase
            .from('stories')
            .update({ paragraphs: updatedParagraphs })
            .eq('id', storyId);
        }
      }

      throw new Error('Image generation is temporarily unavailable. Using beautiful alternative illustrations.');
    }
    
    // For other errors, throw them to be handled by the caller
    throw error;
  }
};

export const generateStoryParagraphs = (content: string): StoryParagraph[] => {
  return content
    .split('\n\n')
    .filter(text => text.trim().length > 0)
    .map((text, index) => ({
      text: text.trim(),
      page_number: index + 1,
      image_url: undefined
    }));
};

export const shouldRegenerateImage = (
  originalContent: string,
  newContent: string
): boolean => {
  const similarity = calculateSimilarity(originalContent, newContent);
  return similarity < 0.7;
};

function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}