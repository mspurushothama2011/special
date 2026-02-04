-- Enable Row Level Security (RLS) policies for security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- 1. PROFILES (Extends default Auth)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. EVENTS (Calendar & Timeline)
create table events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  date timestamp with time zone not null,
  is_recurring boolean default false,
  type text check (type in ('date', 'anniversary', 'trip', 'other')) default 'other',
  created_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. EXPENSES (Finance Tracking)
create table expenses (
  id uuid default uuid_generate_v4() primary key,
  amount numeric not null,
  description text not null,
  category text check (category in ('food', 'travel', 'date', 'bills', 'shopping', 'other')) default 'other',
  paid_by uuid references profiles(id),
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PHOTOS (Memories)
create table photos (
  id uuid default uuid_generate_v4() primary key,
  url text not null,
  caption text,
  storage_path text, -- for easier deletion from storage bucket
  uploaded_by uuid references profiles(id),
  taken_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. MESSAGES (Chat)
create table messages (
  id uuid default uuid_generate_v4() primary key,
  content text,
  image_url text,
  sender_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Allow authenticated users to read/write everything for now, can be stricter later)

-- Profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Events
alter table events enable row level security;
create policy "Events are viewable by auth users" on events for select to authenticated using (true);
create policy "Events are insertable by auth users" on events for insert to authenticated with check (true);
create policy "Events are updateable by auth users" on events for update to authenticated using (true);

-- Expenses
alter table expenses enable row level security;
create policy "Expenses are viewable by auth users" on expenses for select to authenticated using (true);
create policy "Expenses are insertable by auth users" on expenses for insert to authenticated with check (true);

-- Photos
alter table photos enable row level security;
create policy "Photos are viewable by auth users" on photos for select to authenticated using (true);
create policy "Photos are insertable by auth users" on photos for insert to authenticated with check (true);

-- Messages
alter table messages enable row level security;
create policy "Messages are viewable by auth users" on messages for select to authenticated using (true);
create policy "Messages are insertable by auth users" on messages for insert to authenticated with check (true);

-- STORAGE BUCKET setup (You must do this in the Dashboard for now, but here is the policy logic)
-- Bucket name: 'memories'
-- Policy: Give authenticated users INSERT and SELECT access.
