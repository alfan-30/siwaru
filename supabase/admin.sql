-- ============================================================
-- SIWARU — Pengelolaan akun admin (dijalankan di Supabase SQL Editor)
-- Registrasi di aplikasi hanya untuk guru & siswa. Admin dibuat manual.
-- ============================================================

-- ------------------------------------------------------------
-- A. MEMBUAT AKUN ADMIN
-- Langkah 1 (di dashboard, bukan SQL):
--   Authentication -> Users -> Add user -> Create new user
--   Isi email + password admin, lalu centang "Auto Confirm User".
-- Langkah 2: ganti email/nama/NIP di bawah, lalu jalankan:
-- ------------------------------------------------------------
update public.profiles
set jabatan = 'admin',
    nama    = 'Administrator',
    nip_nis = 'ADMIN001'
where email = 'admin@siwaru.sch.id';   -- <- ganti dengan email admin yang dibuat di langkah 1

-- Cek hasilnya (harus muncul 1 baris dengan jabatan = admin):
select nip_nis, nama, email, jabatan from public.profiles where jabatan = 'admin';

-- Admin bisa login dengan email, atau dengan NIP di atas (mis. ADMIN001) + password dari langkah 1.

-- ------------------------------------------------------------
-- B. RESET PASSWORD PENGGUNA (saat guru/siswa menghubungi admin lewat "Lupa Password")
-- Ganti email dan password sementara, lalu jalankan. Minta pengguna menyimpannya
-- dan jangan membagikan password lewat tempat umum.
-- ------------------------------------------------------------
-- update auth.users
-- set encrypted_password = crypt('PasswordSementara123', gen_salt('bf')),
--     updated_at = now()
-- where email = 'pengguna@gmail.com';
