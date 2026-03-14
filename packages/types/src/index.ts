import { z } from "zod";

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  created_at: z.string().datetime().optional(),
});

export type Tag = z.infer<typeof TagSchema>;

export const SoundSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  storage_path: z.string(),
  duration_ms: z.number().positive(),
  captured_at: z.string().datetime(), // ISO string
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  location_label: z.string().optional(),
  is_public: z.boolean().default(false),
  status: z.enum(["uploading", "ready", "error"]).default("uploading"),
  tags: z.array(TagSchema).optional(),
});

export type Sound = z.infer<typeof SoundSchema>;

export const CreateSoundSchema = SoundSchema.omit({ 
  id: true, 
  status: true,
  tags: true
}).extend({
  tag_names: z.array(z.string()).optional(),
});

export type CreateSound = z.infer<typeof CreateSoundSchema>;

export interface SoundFeatures {
  sound_id: string;
  waveform_data: number[]; // Array of amplitudes
  rms_loudness: number;
  spectral_data?: any; // Future use
}
