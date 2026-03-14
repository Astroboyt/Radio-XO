import { supabase } from './supabase';

/**
 * StorageService handles binary file uploads to Supabase Storage
 * without requiring external file system libraries.
 */
export const StorageService = {
  /**
   * Uploads a local audio file to Supabase using fetch/blob.
   * Path: sounds/{userId}/{filename}
   */
  uploadSound: async (uri: string, userId: string): Promise<string | null> => {
    try {
      // 1. Convert URI to Blob using fetch
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const fileName = `${Date.now()}.m4a`;
      const filePath = `${userId}/${fileName}`;
      
      // 2. Upload to 'sounds' bucket
      const { data, error } = await supabase.storage
        .from('sounds')
        .upload(filePath, blob, {
          contentType: 'audio/m4a',
          upsert: true,
        });

      if (error) {
        console.error('StorageService: Upload failed', error);
        return null;
      }

      return data.path;
    } catch (err) {
      console.error('StorageService: Unexpected error during upload', err);
      return null;
    }
  },

  /**
   * Gets a signed URL or public URL for a sound record.
   */
  getPublicUrl: (path: string): string => {
    const { data } = supabase.storage
      .from('sounds')
      .getPublicUrl(path);
    return data.publicUrl;
  }
};
