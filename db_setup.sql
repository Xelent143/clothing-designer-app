-- 1. Create table if it doesn't exist (basic fields)
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  mobile_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add new columns safely (Run this block even if table exists)
alter table profiles add column if not exists role text default 'user';
alter table profiles add column if not exists is_active boolean default true;
alter table profiles add column if not exists credits int default 5;

-- 3. Enable RLS
alter table profiles enable row level security;

-- 4. Re-create Policies (Drop first to avoid errors if they exist)
drop policy if exists "Admins can view all profiles." on profiles;
create policy "Admins can view all profiles." on profiles
  for select using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Admins can update all profiles." on profiles;
create policy "Admins can update all profiles." on profiles
  for update using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "Users can view own profile." on profiles;
create policy "Users can view own profile." on profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- 5. Update the Trigger Function
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  -- Check if the email is the super admin email
  if new.email = 'xelenttraders@gmail.com' then
    insert into public.profiles (id, email, full_name, mobile_number, role, is_active, credits)
    values (
      new.id, 
      new.email, 
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'mobile_number',
      'admin',
      true,
      9999
    );
  else
    insert into public.profiles (id, email, full_name, mobile_number, role, is_active, credits)
    values (
      new.id, 
      new.email, 
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'mobile_number',
      'user',
      true,
      5
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 6. Attach Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
