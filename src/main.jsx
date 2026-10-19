import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './tailwind.css';

// React bridge: the existing SIWARU HTML/CSS remains the source of the UI.
// React handles Supabase auth without rebuilding or restyling the original pages.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

function alertBox(options) {
  if (window.Swal) return window.Swal.fire({ confirmButtonColor: '#1d63ff', ...options });
  window.alert(options.text || options.title || 'Terjadi kesalahan');
  return Promise.resolve();
}
// Kontak admin untuk lupa password (reset dilakukan manual oleh admin).
const NOMOR_ADMIN = '085784828955';
const LINK_WA_ADMIN = 'https://wa.me/62' + NOMOR_ADMIN.slice(1);

const todayWIB = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date()); // YYYY-MM-DD
const fmtTanggal = iso => { const [y, m, d] = String(iso || '').split('-'); return d ? `${d}-${m}-${y}` : ''; };
const fmtJam = t => String(t || '').slice(0, 5).replace(':', '.');
const STATUS_CLASS = { masuk: 'bg-green-500', hadir: 'bg-green-500', izin: 'bg-yellow-500', sakit: 'bg-yellow-500', alpa: 'bg-red-500', terlambat: 'bg-red-500' };

function destinationFor(role) {
  const value = String(role || '').toLowerCase().replaceAll('_',' ').trim();
  if (value === 'admin' || value === 'administrator') return 'DashboardADMIN.html';
  if (value === 'guru bk' || value === 'gurubk') return 'DashboardGURUBK.html';
  if (value === 'guru' || value === 'guru mapel' || value === 'guru_mapel') return 'DashboardGURU.html';
  return 'DashboardSISWA.html';
}

function SupabaseBridge() {
  useEffect(() => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const forgotPassword = document.getElementById('forgotPassword');
    const listeners = [];
    const listen = (el, event, fn) => { if (el) { el.addEventListener(event, fn); listeners.push(() => el.removeEventListener(event, fn)); } };

    if (forgotPassword) listen(forgotPassword, 'click', async (event) => {
      event.preventDefault();
      if (!window.Swal) { window.alert(`Lupa password? Silakan hubungi admin di nomor ${NOMOR_ADMIN}.`); return; }
      const result = await window.Swal.fire({
        icon: 'info',
        title: 'Lupa Password?',
        html: `Silakan hubungi admin di nomor <b>${NOMOR_ADMIN}</b> untuk mengatur ulang password Anda.`,
        showCancelButton: true,
        confirmButtonText: 'Hubungi via WhatsApp',
        cancelButtonText: 'Tutup',
        confirmButtonColor: '#1d63ff'
      });
      if (result.isConfirmed) window.open(LINK_WA_ADMIN, '_blank', 'noopener');
    });

    if (resetPasswordForm) listen(resetPasswordForm, 'submit', async (event) => {
      event.preventDefault();
      if (!supabase) return alertBox({ icon: 'error', title: 'Supabase belum dikonfigurasi', text: 'Isi variabel Supabase di .env.local terlebih dahulu.' });
      const password = document.getElementById('newPassword')?.value || '';
      const confirmation = document.getElementById('confirmNewPassword')?.value || '';
      if (!/^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/.test(password)) return alertBox({ icon: 'error', title: 'Password kurang kuat', text: 'Gunakan minimal 8 karakter yang mengandung huruf dan angka.' });
      if (password !== confirmation) return alertBox({ icon: 'error', title: 'Password tidak sama', text: 'Konfirmasi password tidak sama.' });
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return alertBox({ icon: 'error', title: 'Reset password gagal', text: error.message });
      await alertBox({ icon: 'success', title: 'Password berhasil diubah', text: 'Silakan login menggunakan password baru.' });
      window.location.href = 'login.html';
    });

    if (loginForm) listen(loginForm, 'submit', async (event) => {
      event.preventDefault();
      if (!supabase) return alertBox({ icon: 'error', title: 'Supabase belum dikonfigurasi', text: 'Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY pada file .env.local, lalu jalankan ulang npm run dev.' });
      const username = document.getElementById('username')?.value.trim() || '';
      const password = document.getElementById('password')?.value || '';
      if (!username || !password) return alertBox({ icon: 'error', title: 'Login Gagal', text: 'Username/email dan password wajib diisi.' });
      let email = username;
      // Login dengan NIP/NIS: cari email lewat fungsi database (pengguna belum punya sesi, jadi tidak bisa membaca tabel profiles langsung).
      if (!username.includes('@')) {
        const { data: found, error: lookupError } = await supabase.rpc('email_for_login', { p_nip: username });
        if (lookupError || !found) return alertBox({ icon: 'error', title: 'Login Gagal', text: 'NIP/NIS tidak ditemukan. Gunakan email yang terdaftar atau periksa data akun.' });
        email = found;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return alertBox({ icon: 'error', title: 'Login Gagal', text: /invalid login credentials/i.test(error.message) ? 'Email/NIP/NIS atau password salah.' : error.message });
      // Peran hanya dibaca dari tabel profiles (user_metadata bisa diubah pengguna sendiri, jadi tidak dipercaya).
      const { data: profile } = await supabase.from('profiles').select('jabatan').eq('id', data.user.id).maybeSingle();
      const role = profile?.jabatan || 'siswa';
      await alertBox({ icon: 'success', title: 'Login Berhasil', text: 'Selamat datang di SIWARU!', timer: 1200, showConfirmButton: false });
      window.location.href = destinationFor(role);
    });

    if (registerForm) listen(registerForm, 'submit', async (event) => {
      event.preventDefault();
      if (!supabase) return alertBox({ icon: 'error', title: 'Supabase belum dikonfigurasi', text: 'Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY pada file .env.local, lalu jalankan ulang npm run dev.' });
      const get = id => document.getElementById(id)?.value?.trim() || '';
      const nip_nis=get('nip_nis'), nama=get('nama'), kelas=get('kelas'), jabatan=get('jabatan').toLowerCase(), no_tlp=get('no_tlp'), alamat=get('alamat'), jenis_kelamin=get('jenis_kelamin'), email=get('email'), password=document.getElementById('password')?.value || '', confirm=document.getElementById('konfirmasi_password')?.value || '';
      if (![nip_nis,nama,jabatan,no_tlp,alamat,jenis_kelamin,email,password,confirm].every(Boolean)) return alertBox({ icon:'warning', title:'Peringatan', text:'Wajib mengisi semua form inputan.' });
      const prefix = nip_nis.slice(0, 2);
      if (prefix !== '12' && prefix !== '14') return alertBox({ icon:'error', title:'NIP/NIS tidak valid', text:'NIP guru diawali 12 dan NIS siswa diawali 14.' });
      if (jabatan !== (prefix === '12' ? 'guru' : 'siswa')) return alertBox({ icon:'error', title:'Jabatan tidak sesuai', text:'Jabatan harus sesuai dengan awalan NIP/NIS (12 = Guru, 14 = Siswa).' });
      if (jabatan === 'siswa' && !kelas) return alertBox({ icon:'warning', title:'Peringatan', text:'Siswa wajib memilih kelas.' });
      if (!/^\d+$/.test(nip_nis) || !/^\d{1,12}$/.test(no_tlp)) return alertBox({ icon:'error', title:'Periksa data', text:'NIP/NIS dan nomor telepon harus berupa angka; nomor telepon maksimal 12 digit.' });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alertBox({ icon:'error', title:'Email tidak valid', text:'Masukkan alamat email yang valid.' });
      if (!/^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/.test(password)) return alertBox({ icon:'error', title:'Password kurang kuat', text:'Password minimal 8 karakter dan harus mengandung huruf serta angka.' });
      if (password !== confirm) return alertBox({ icon:'error', title:'Password tidak sama', text:'Konfirmasi password tidak sama dengan password.' });
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nip_nis, nama, kelas: kelas || null, jabatan, no_tlp, alamat, jenis_kelamin } } });
      if (error) {
        console.error('signUp error:', error);
        let text = error.message;
        if (/database error saving new user/i.test(text)) text = 'Registrasi gagal. NIP/NIS kemungkinan sudah terdaftar. Periksa kembali data Anda, atau hubungi admin jika masalah berlanjut.';
        else if (/already registered/i.test(text)) text = 'Email ini sudah terdaftar. Gunakan email lain atau langsung login.';
        return alertBox({ icon:'error', title:'Registrasi Gagal', text });
      }
      if (data.user && !data.session) {
        await alertBox({ icon:'warning', title:'Akun dibuat, tetapi konfirmasi masih aktif', text:'Untuk registrasi langsung tanpa konfirmasi email, buka Supabase Dashboard → Authentication → Providers → Email, lalu nonaktifkan Confirm email.' });
        return;
      }
      await alertBox({ icon:'success', title:'Registrasi berhasil', text:'Akun dan profil berhasil disimpan. Silakan login.' });
      window.location.href='login.html';
    });

    // ===== Absensi guru & siswa (halaman yang punya #absensiForm) =====
    const absensiForm = document.getElementById('absensiForm');
    if (absensiForm) {
      const isGuruPage = !!document.getElementById('detailJam'); // halaman guru: kolom Jam sebelum Tanggal
      const tbody = document.querySelector('main table tbody');
      const val = id => document.getElementById(id)?.value?.trim() || '';

      const renderRows = rows => {
        if (!tbody) return;
        tbody.innerHTML = '';
        if (!rows.length) {
          const tr = document.createElement('tr');
          const td = document.createElement('td');
          td.colSpan = 8; td.className = 'p-4 text-gray-500'; td.textContent = 'Belum ada data absensi.';
          tr.appendChild(td); tbody.appendChild(tr); return;
        }
        rows.forEach((r, i) => {
          const tanggal = fmtTanggal(r.tanggal), jam = fmtJam(r.waktu);
          const tr = document.createElement('tr'); tr.className = 'border-b';
          const cell = (text, cls = 'p-4') => { const td = document.createElement('td'); td.className = cls; td.textContent = text; tr.appendChild(td); return td; };
          cell(String(i + 1)); cell(r.nama_siswa, 'p-4 font-medium'); cell(r.nis); cell(r.mata_pelajaran || '-');
          if (isGuruPage) { cell(jam); cell(tanggal); } else { cell(tanggal); cell(jam); }
          const statusTd = cell('');
          const badge = document.createElement('span');
          badge.className = `${STATUS_CLASS[String(r.status).toLowerCase()] || 'bg-gray-500'} text-white px-3 py-1 rounded-full text-xs`;
          badge.textContent = r.status; statusTd.appendChild(badge);
          const aksi = cell('Detail', 'p-4 text-blue-600 cursor-pointer');
          aksi.addEventListener('click', () => {
            if (isGuruPage) window.openDetail?.(r.nama_siswa, r.nis, r.mata_pelajaran || '-', jam, tanggal, r.status);
            else window.openDetail?.(r.nama_siswa, r.nis, r.mata_pelajaran || '-', tanggal, jam, r.status);
          });
          tbody.appendChild(tr);
        });
      };

      const loadRows = async () => {
        const { data, error } = await supabase.from('attendance')
          .select('nama_siswa,nis,mata_pelajaran,tanggal,waktu,status')
          .order('tanggal', { ascending: false }).order('waktu', { ascending: false }).limit(200);
        if (error) { console.error('Gagal memuat absensi:', error); return; }
        renderRows(data || []);
      };

      listen(absensiForm, 'submit', async (event) => {
        event.preventDefault();
        if (!supabase) return alertBox({ icon: 'error', title: 'Supabase belum dikonfigurasi', text: 'Isi variabel Supabase di .env.local terlebih dahulu.' });
        const jadwal = window.SIWARU_ABSENSI;
        if (jadwal && !jadwal.isOpen()) return alertBox({ icon: 'warning', title: 'Absensi ditutup', text: `Absensi hanya dibuka pukul ${jadwal.jamBuka} sampai ${jadwal.jamTutup} WIB.` });
        const mapel = val('mapel'), status = val('status');
        if (!mapel || !status) return alertBox({ icon: 'warning', title: 'Peringatan', text: 'Mata pelajaran dan status wajib diisi.' });
        // Nama, NIS/NIP, tanggal, dan jam dipaksa oleh server dari akun yang login.
        const { error } = await supabase.from('attendance').insert({ nama_siswa: val('namaSiswa'), nis: val('nisSiswa'), mata_pelajaran: mapel, status, tanggal: todayWIB() });
        if (error) {
          let text = error.message;
          if (error.code === '23505') text = 'Anda sudah melakukan absensi hari ini.';
          return alertBox({ icon: 'error', title: 'Absensi gagal', text });
        }
        await alertBox({ icon: 'success', title: 'Absensi berhasil', text: 'Absensi Anda sudah tersimpan.', timer: 1500, showConfirmButton: false });
        document.getElementById('mapel').value = ''; document.getElementById('status').value = '';
        window.closeAbsensiForm?.();
        loadRows();
      });

      (async () => {
        if (!supabase) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { await alertBox({ icon: 'warning', title: 'Silakan login', text: 'Anda harus login untuk membuka halaman absensi.' }); window.location.href = 'login.html'; return; }
        const { data: profile } = await supabase.from('profiles').select('nama,nip_nis').eq('id', session.user.id).maybeSingle();
        const lock = (id, value) => { const el = document.getElementById(id); if (el) { el.value = value; el.readOnly = true; el.classList.add('bg-gray-100'); } };
        if (profile) { lock('namaSiswa', profile.nama); lock('nisSiswa', profile.nip_nis); }
        lock('tanggal', todayWIB()); const tgl = document.getElementById('tanggal'); if (tgl) tgl.style.pointerEvents = 'none';
        loadRows();
      })();
    }
    return () => listeners.forEach(remove => remove());
  }, []);
  return <span aria-hidden="true" />;
}

const root = document.getElementById('react-bridge');
if (root) createRoot(root).render(<SupabaseBridge />);
