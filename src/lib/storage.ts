import { supabase } from './supabase';

interface UploadOptions {
  bucket?: string;
  upsert?: boolean;
}

export const uploadImage = async (
  file: File,
  path: string,
  options: UploadOptions = {}
): Promise<string> => {
  const {
    bucket = 'story-images',
    upsert = false
  } = options;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert });

    if (error) throw error;

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (
  path: string,
  bucket: string = 'story-images'
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const generateStoragePath = (
  prefix: string,
  file: File
): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop();
  return `${prefix}/${timestamp}-${randomString}.${extension}`;
};