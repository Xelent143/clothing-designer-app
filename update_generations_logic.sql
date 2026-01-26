-- 1. Ensure expiry_date column exists in profiles
alter table profiles add column if not exists expiry_date timestamp with time zone;

-- 2. Update the Trigger Function to set default credits to 0 for new users
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
      0 -- Default credits set to 0 as requested
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;
