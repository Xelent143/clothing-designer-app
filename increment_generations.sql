-- Function to safely increment total_generations
create or replace function increment_generations(user_id uuid, amount int)
returns void
language plpgsql
security definer
as $$
begin
  update profiles
  set total_generations = coalesce(total_generations, 0) + amount
  where id = user_id;
end;
$$;
