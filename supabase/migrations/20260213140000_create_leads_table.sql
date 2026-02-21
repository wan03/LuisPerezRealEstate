create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  role text not null, -- 'buyer', 'seller', 'investor'
  timeline text,
  motivation text,
  financials jsonb default '{}'::jsonb, -- Stores priceRange, preApproved, estimatedValue, etc.
  name text not null,
  email text not null,
  phone text,
  source_url text, -- To track where the lead came from (Navbar, Hero, Blog, etc.)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table leads enable row level security;

-- Allow anyone (anon + auth) to submit a lead
create policy "Enable insert for all users"
  on leads for insert
  with check (true);

-- Only service_role or specific admins can view leads (locking it down for now)
create policy "Enable select for service_role only"
  on leads for select
  using (auth.role() = 'service_role');
