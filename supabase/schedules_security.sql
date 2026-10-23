-- Jalankan di Supabase SQL Editor setelah supabase/schema.sql.
-- Memperketat akses jadwal; tidak menghapus atau mengubah data jadwal.
alter table public.schedules enable row level security;

drop policy if exists schedules_authenticated_select on public.schedules;
drop policy if exists schedules_authenticated_insert on public.schedules;
drop policy if exists schedules_authenticated_update on public.schedules;
drop policy if exists schedules_authenticated_delete on public.schedules;
drop policy if exists schedules_read_related on public.schedules;
drop policy if exists schedules_admin_insert on public.schedules;
drop policy if exists schedules_admin_update on public.schedules;
drop policy if exists schedules_admin_delete on public.schedules;

create policy schedules_read_related on public.schedules for select to authenticated using (
  public.is_admin()
  or (lower(coalesce(public.current_jabatan(),'')) = 'siswa' and kelas = (select p.kelas from public.profiles p where p.id = auth.uid()))
  or (lower(replace(coalesce(public.current_jabatan(),''),'_',' ')) in ('guru','guru mapel') and lower(coalesce(guru,'')) = lower((select p.nama from public.profiles p where p.id = auth.uid())))
);
create policy schedules_admin_insert on public.schedules for insert to authenticated with check (public.is_admin());
create policy schedules_admin_update on public.schedules for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy schedules_admin_delete on public.schedules for delete to authenticated using (public.is_admin());
