-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Sounds Table
create table public.sounds (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  storage_path text not null, -- R2 or Supabase Storage key
  duration_ms integer not null,
  captured_at timestamp with time zone not null, -- Geotagging: Date & Time
  lat double precision not null,                 -- Geotagging: Latitude
  lng double precision not null,                 -- Geotagging: Longitude
  location_label text,                           -- Human readable location
  is_public boolean default false,
  status text check (status in ('uploading', 'ready', 'error')) default 'uploading',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  uploaded_at timestamp with time zone
);

-- 3. Sound Features Table (Future Proofing)
create table public.sound_features (
  sound_id uuid references public.sounds on delete cascade primary key,
  waveform_data jsonb not null, -- Array of amplitudes
  rms_loudness double precision,
  spectral_centroid double precision,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.sounds enable row level security;
alter table public.sound_features enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Policies for Sounds
create policy "Sounds are viewable by owner or if public." on public.sounds
  for select using (auth.uid() = user_id or is_public = true);

create policy "Users can create sounds." on public.sounds
  for insert with check (auth.uid() = user_id);

create policy "Users can update own sounds." on public.sounds
  for update using (auth.uid() = user_id);

create policy "Users can delete own sounds." on public.sounds
  for delete using (auth.uid() = user_id);
