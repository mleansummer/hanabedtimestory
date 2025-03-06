import { supabase } from './supabase';

export async function captureAndStoreImage(imageUrl: string): Promise<string> {
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Create an image element
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Wait for image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });

    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image to canvas
    ctx.drawImage(img, 0, 0);

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        'image/jpeg',
        0.95
      );
    });

    // Create a File object from the blob
    const file = new File([blob], `story-image-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('story-images')
      .upload(`generated/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('story-images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error capturing and storing image:', error);
    // Return the original URL as fallback
    return imageUrl;
  }
}