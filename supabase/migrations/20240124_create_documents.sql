insert into storage.buckets (id, name, public) values ('client-docs', 'client-docs', false) on conflict do nothing;

create table if not exists documents (
    id uuid default gen_random_uuid() primary key,
    client_id uuid references auth.users(id) not null,
    name text not null,
    file_path text not null,
    status text default 'uploaded',
    category text default 'uncategorized',
    created_at timestamptz default now()
);

alter table documents enable row level security;
create policy "Users can view own documents" on documents for select using (auth.uid() = client_id);
create policy "Users can insert own documents" on documents for insert with check (auth.uid() = client_id);

-- Policy for storage objects
create policy "Authenticated can upload" on storage.objects for insert to authenticated with check (bucket_id = 'client-docs');
create policy "Authenticated can select own" on storage.objects for select to authenticated using (bucket_id = 'client-docs');
