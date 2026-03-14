-- 1. Automated Profile Creation Task
-- This function will run every time a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id, 
    split_part(new.email, '@', 1) || '_' || lower(substring(md5(random()::text) from 1 for 4)), -- Generate default username
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Saved Sounds (Favorites)
-- Junction table between profiles and sounds
create table public.saved_sounds (
  user_id uuid references public.profiles(id) on delete cascade not null,
  sound_id uuid references public.sounds(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, sound_id)
);

-- 3. RLS for Saved Sounds
alter table public.saved_sounds enable row level security;

create policy "Users can view their own saved sounds." on public.saved_sounds
  for select using (auth.uid() = user_id);

create policy "Users can save sounds." on public.saved_sounds
  for insert with check (auth.uid() = user_id);

create policy "Users can unsave sounds." on public.saved_sounds
  for delete using (auth.uid() = user_id);

-- 4. Profile Stats Expansion (Views or Computed Fields are better for real-time, 
-- but we can add columns for cached stats if needed later)
alter table public.profiles 
  add column if not exists bio text,
  add column if not exists website text;

-- 5. Indexes
create index idx_saved_sounds_user_id on public.saved_sounds(user_id);
create index idx_saved_sounds_sound_id on public.saved_sounds(sound_id);
