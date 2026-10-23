-- ============================================================
-- SIWARU — Kelola akun oleh admin (buat / edit / hapus) + kelas & mapel
-- Jalankan di Supabase SQL Editor SETELAH schema.sql. Aman dijalankan ulang.
-- ============================================================
create extension if not exists pgcrypto;

-- Kode mata pelajaran (MP001, MP002, ...)
alter table public.subjects add column if not exists kode_mapel text;
create unique index if not exists subjects_kode_mapel_uniq on public.subjects(kode_mapel) where kode_mapel is not null;

-- Kelas & mapel: semua pengguna login boleh melihat, hanya admin yang boleh mengubah.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['classes','subjects'] LOOP
  EXECUTE format('drop policy if exists %I on public.%I', t||'_authenticated_select', t);
  EXECUTE format('drop policy if exists %I on public.%I', t||'_authenticated_insert', t);
  EXECUTE format('drop policy if exists %I on public.%I', t||'_authenticated_update', t);
  EXECUTE format('drop policy if exists %I on public.%I', t||'_authenticated_delete', t);
  EXECUTE format('drop policy if exists %I on public.%I', t||'_read', t);
  EXECUTE format('drop policy if exists %I on public.%I', t||'_admin_insert', t);
  EXECUTE format('drop policy if exists %I on public.%I', t||'_admin_update', t);
  EXECUTE format('drop policy if exists %I on public.%I', t||'_admin_delete', t);
  EXECUTE format('create policy %I on public.%I for select to authenticated using (true)', t||'_read', t);
  EXECUTE format('create policy %I on public.%I for insert to authenticated with check (public.is_admin())', t||'_admin_insert', t);
  EXECUTE format('create policy %I on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t||'_admin_update', t);
  EXECUTE format('create policy %I on public.%I for delete to authenticated using (public.is_admin())', t||'_admin_delete', t);
 END LOOP;
END $$;

-- ===== Salinan password agar admin bisa melihatnya di tabel Data Guru/Siswa =====
-- Disimpan terpisah dari profiles; hanya admin yang boleh membaca (RLS). Hanya diisi lewat fungsi admin_* di bawah.
create table if not exists public.account_secrets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  password_plain text not null,
  updated_at timestamptz not null default now()
);
alter table public.account_secrets enable row level security;
revoke all on public.account_secrets from anon, authenticated;
grant select on public.account_secrets to authenticated;
drop policy if exists account_secrets_admin_read on public.account_secrets;
create policy account_secrets_admin_read on public.account_secrets for select to authenticated using (public.is_admin());

-- ===== Buat akun guru / siswa =====
create or replace function public.admin_create_user(
  p_nip text, p_nama text, p_jabatan text, p_kelas text, p_no_tlp text,
  p_alamat text, p_jenis_kelamin text, p_email text, p_password text)
returns uuid
language plpgsql security definer set search_path = public, extensions, auth
as $$
declare
  v_id uuid := gen_random_uuid();
  v_nip text := trim(coalesce(p_nip,''));
  v_jab text := lower(trim(coalesce(p_jabatan,'')));
  v_email text := lower(trim(coalesce(p_email,'')));
  v_kelas text := nullif(trim(coalesce(p_kelas,'')),'');
begin
  if not public.is_admin() then raise exception 'Hanya admin yang dapat membuat akun.'; end if;
  if v_jab not in ('guru','siswa') then raise exception 'Jabatan harus guru atau siswa.'; end if;
  if v_nip !~ '^[0-9]+$' then raise exception 'NIP/NIS harus berupa angka.'; end if;
  if v_jab = 'siswa' and v_nip not like '14%' then raise exception 'NIS siswa harus diawali 14.'; end if;
  if v_jab <> 'siswa' and v_nip not like '12%' then raise exception 'NIP guru harus diawali 12.'; end if;
  if v_jab = 'siswa' and v_kelas is null then raise exception 'Siswa wajib memiliki kelas.'; end if;
  if trim(coalesce(p_nama,'')) = '' then raise exception 'Nama wajib diisi.'; end if;
  if v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then raise exception 'Email tidak valid.'; end if;
  if coalesce(p_password,'') !~ '^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$' then
    raise exception 'Password minimal 8 karakter dan harus mengandung huruf serta angka.'; end if;
  if exists (select 1 from public.profiles where nip_nis = v_nip) then raise exception 'NIP/NIS % sudah terdaftar.', v_nip; end if;
  if exists (select 1 from auth.users where lower(email) = v_email) then raise exception 'Email % sudah terdaftar.', v_email; end if;

  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
    crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nip_nis', v_nip, 'nama', trim(p_nama), 'kelas', v_kelas,
      'no_tlp', p_no_tlp, 'alamat', p_alamat, 'jenis_kelamin', p_jenis_kelamin),
    now(), now(), '', '', '', '');

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text,
    jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
    'email', now(), now(), now());

  -- Profil dibuat otomatis oleh trigger handle_new_user; pastikan jabatannya sesuai.
  update public.profiles set jabatan = v_jab where id = v_id;
  insert into public.account_secrets (user_id, password_plain) values (v_id, p_password);
  return v_id;
end $$;

-- ===== Edit akun (password opsional: kosong = tidak diubah) =====
create or replace function public.admin_update_user(
  p_id uuid, p_nip text, p_nama text, p_jabatan text, p_kelas text, p_no_tlp text,
  p_alamat text, p_jenis_kelamin text, p_email text, p_password text default null)
returns void
language plpgsql security definer set search_path = public, extensions, auth
as $$
declare
  v_old public.profiles;
  v_nip text := trim(coalesce(p_nip,''));
  v_jab text := lower(trim(coalesce(p_jabatan,'')));
  v_email text := lower(trim(coalesce(p_email,'')));
  v_kelas text := nullif(trim(coalesce(p_kelas,'')),'');
begin
  if not public.is_admin() then raise exception 'Hanya admin yang dapat mengubah akun.'; end if;
  select * into v_old from public.profiles where id = p_id;
  if not found then raise exception 'Akun tidak ditemukan.'; end if;
  if lower(v_old.jabatan) in ('admin','administrator') then raise exception 'Akun admin tidak dapat diubah dari sini.'; end if;
  if v_jab not in ('guru','siswa') then raise exception 'Jabatan harus guru atau siswa.'; end if;
  if (lower(v_old.jabatan) = 'siswa') <> (v_jab = 'siswa') then raise exception 'Akun guru dan siswa tidak dapat saling dipindahkan.'; end if;
  if v_nip !~ '^[0-9]+$' then raise exception 'NIP/NIS harus berupa angka.'; end if;
  if v_jab = 'siswa' and v_nip not like '14%' then raise exception 'NIS siswa harus diawali 14.'; end if;
  if v_jab <> 'siswa' and v_nip not like '12%' then raise exception 'NIP guru harus diawali 12.'; end if;
  if v_jab = 'siswa' and v_kelas is null then raise exception 'Siswa wajib memiliki kelas.'; end if;
  if trim(coalesce(p_nama,'')) = '' then raise exception 'Nama wajib diisi.'; end if;
  if v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then raise exception 'Email tidak valid.'; end if;
  if coalesce(p_password,'') <> '' and p_password !~ '^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$' then
    raise exception 'Password minimal 8 karakter dan harus mengandung huruf serta angka.'; end if;
  if exists (select 1 from public.profiles where nip_nis = v_nip and id <> p_id) then raise exception 'NIP/NIS % sudah dipakai akun lain.', v_nip; end if;
  if exists (select 1 from auth.users where lower(email) = v_email and id <> p_id) then raise exception 'Email % sudah dipakai akun lain.', v_email; end if;

  update public.profiles set nip_nis = v_nip, nama = trim(p_nama), jabatan = v_jab,
    kelas = case when v_jab = 'siswa' then v_kelas else null end,
    no_tlp = p_no_tlp, alamat = p_alamat, jenis_kelamin = p_jenis_kelamin,
    email = v_email, updated_at = now()
  where id = p_id;

  update auth.users set email = v_email, updated_at = now(),
    encrypted_password = case when coalesce(p_password,'') <> '' then crypt(p_password, gen_salt('bf')) else encrypted_password end
  where id = p_id;

  update auth.identities set identity_data = jsonb_set(identity_data, '{email}', to_jsonb(v_email)), updated_at = now()
  where user_id = p_id and provider = 'email';

  if coalesce(p_password,'') <> '' then
    insert into public.account_secrets (user_id, password_plain) values (p_id, p_password)
    on conflict (user_id) do update set password_plain = excluded.password_plain, updated_at = now();
  end if;
end $$;

-- ===== Hapus akun =====
create or replace function public.admin_delete_user(p_id uuid)
returns void
language plpgsql security definer set search_path = public, extensions, auth
as $$
declare v_old public.profiles;
begin
  if not public.is_admin() then raise exception 'Hanya admin yang dapat menghapus akun.'; end if;
  if p_id = auth.uid() then raise exception 'Anda tidak dapat menghapus akun sendiri.'; end if;
  select * into v_old from public.profiles where id = p_id;
  if not found then raise exception 'Akun tidak ditemukan.'; end if;
  if lower(v_old.jabatan) in ('admin','administrator') then raise exception 'Akun admin tidak dapat dihapus dari sini.'; end if;
  delete from auth.users where id = p_id;   -- profil & identitas ikut terhapus (on delete cascade)
end $$;

revoke all on function public.admin_create_user(text,text,text,text,text,text,text,text,text) from public;
revoke all on function public.admin_update_user(uuid,text,text,text,text,text,text,text,text,text) from public;
revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_create_user(text,text,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.admin_update_user(uuid,text,text,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- Fitur Guru BK dihapus: ubah/hapus absensi hanya untuk admin.
drop policy if exists "attendance update" on public.attendance;
create policy "attendance update" on public.attendance for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
