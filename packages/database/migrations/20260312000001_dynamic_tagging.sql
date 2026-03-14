-- 1. Create Tags Table
create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Sound Tags Junction Table (Many-to-Many)
create table public.sound_tags (
  sound_id uuid references public.sounds on delete cascade not null,
  tag_id uuid references public.tags on delete cascade not null,
  primary key (sound_id, tag_id)
);

-- 3. Enable RLS
alter table public.tags enable row level security;
alter table public.sound_tags enable row level security;

-- 4. Policies for Tags
create policy "Tags are viewable by everyone." on public.tags
  for select using (true);

create policy "Authenticated users can create tags." on public.tags
  for insert with check (auth.role() = 'authenticated');

-- 5. Policies for Sound Tags
create policy "Sound tags are viewable by everyone if public." on public.sound_tags
  for select using (
    exists (
      select 1 from public.sounds 
      where id = sound_tags.sound_id 
      and (is_public = true or user_id = auth.uid())
    )
  );

create policy "Users can tag their own sounds." on public.sound_tags
  for insert with check (
    exists (
      select 1 from public.sounds 
      where id = sound_id 
      and user_id = auth.uid()
    )
  );

create policy "Users can remove tags from their own sounds." on public.sound_tags
  for delete using (
    exists (
      select 1 from public.sounds 
      where id = sound_id 
      and user_id = auth.uid()
    )
  );

-- 6. Indexes for Performance
create index idx_sound_tags_sound_id on public.sound_tags(sound_id);
create index idx_sound_tags_tag_id on public.sound_tags(tag_id);
create index idx_tags_name on public.tags(name);
