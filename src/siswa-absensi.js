import { createClient } from '@supabase/supabase-js';

// Halaman absensi siswa. Jam buka/tutup mengikuti js/absensi-config.js (07:00 - 07:30 WIB)
// dan dipaksa juga di database (trigger enforce_attendance_rules).
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;
const $ = (id) => document.getElementById(id);
const jadwal = window.SIWARU_ABSENSI;
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const todayWIB = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
const alertBox = (o) => window.Swal ? window.Swal.fire({ confirmButtonColor: '#2563eb', ...o }) : Promise.resolve(window.alert(o.text || o.title));

let profile = null;
let sudahAbsen = false;

function tickClock() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
  $('clock').textContent = `${p.day} ${BULAN[+p.month - 1]} ${p.year} pukul ${p.hour}:${p.minute}:${p.second}`;
  renderKeterangan();
}
function renderKeterangan() {
  const el = $('infoKet'); if (!profile) return;
  const s = jadwal.status();
  let text, cls;
  if (sudahAbsen) [text, cls] = ['Sudah Absen Hari Ini', 'text-green-600'];
  else if (s === 'buka') [text, cls] = [`Absensi Dibuka (sampai ${jadwal.jamTutup} WIB)`, 'text-green-600'];
  else if (s === 'tutup') [text, cls] = ['Absensi Sudah Ditutup', 'text-red-600'];
  else [text, cls] = ['Absensi Belum Dibuka', 'text-gray-500'];
  el.textContent = text; el.className = cls;
  $('btnAbsen').classList.toggle('opacity-60', sudahAbsen || s !== 'buka');
}
const openModal = () => { $('absensiModal').classList.remove('hidden'); $('absensiModal').classList.add('flex'); };
const closeModal = () => { $('absensiModal').classList.add('hidden'); $('absensiModal').classList.remove('flex'); };

async function init() {
  $('btnLogout').addEventListener('click', async (e) => { e.preventDefault(); try { await supabase?.auth.signOut(); } finally { location.href = 'login.html'; } });
  $('btnBatal').addEventListener('click', closeModal);
  setInterval(tickClock, 1000); tickClock();
  if (!supabase) return alertBox({ icon: 'error', title: 'Supabase belum dikonfigurasi', text: 'Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY pada .env.local.' });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { await alertBox({ icon: 'warning', title: 'Silakan login', text: 'Anda harus login untuk membuka halaman absensi.' }); location.href = 'login.html'; return; }
  const { data: p } = await supabase.from('profiles').select('nama,nip_nis,kelas,jabatan').eq('id', session.user.id).maybeSingle();
  if (!p) return alertBox({ icon: 'error', title: 'Profil tidak ditemukan', text: 'Periksa data profil pengguna di Supabase.' });
  if (String(p.jabatan || '').toLowerCase() !== 'siswa') { await alertBox({ icon: 'error', title: 'Akses ditolak', text: 'Halaman ini khusus siswa.' }); location.href = 'login.html'; return; }
  profile = p;
  $('infoNis').textContent = p.nip_nis; $('infoNama').textContent = p.nama; $('infoKelas').textContent = p.kelas || '-';
  const { count } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('nis', p.nip_nis).eq('tanggal', todayWIB());
  sudahAbsen = (count || 0) > 0;
  renderKeterangan();

  $('btnAbsen').addEventListener('click', async () => {
    const s = jadwal.status();
    if (sudahAbsen) return alertBox({ icon: 'info', title: 'Sudah absen', text: 'Anda sudah melakukan absensi hari ini.' });
    if (s !== 'buka') return alertBox({ icon: 'warning', title: s === 'tutup' ? 'Absensi ditutup' : 'Absensi belum dibuka', text: `Absensi hanya dibuka pukul ${jadwal.jamBuka} sampai ${jadwal.jamTutup} WIB.` });
    $('namaSiswa').value = p.nama; $('nisSiswa').value = p.nip_nis; $('tanggal').value = todayWIB();
    $('absensiInfo').textContent = `Absensi dibuka sampai pukul ${jadwal.jamTutup} WIB.`; $('absensiInfo').className = 'text-sm font-medium text-green-600';
    openModal();
  });

  $('absensiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!jadwal.isOpen()) { closeModal(); return alertBox({ icon: 'warning', title: 'Absensi ditutup', text: `Absensi hanya dibuka pukul ${jadwal.jamBuka} sampai ${jadwal.jamTutup} WIB.` }); }
    const mapel = $('mapel').value.trim(), status = $('status').value;
    if (!mapel || !status) return alertBox({ icon: 'warning', title: 'Peringatan', text: 'Mata pelajaran dan status wajib diisi.' });
    // Nama, NIS, tanggal, dan jam dipaksa oleh server dari akun yang login.
    const { error } = await supabase.from('attendance').insert({ nama_siswa: p.nama, nis: p.nip_nis, mata_pelajaran: mapel, status, tanggal: todayWIB() });
    if (error) return alertBox({ icon: 'error', title: 'Absensi gagal', text: error.code === '23505' ? 'Anda sudah melakukan absensi hari ini.' : error.message });
    sudahAbsen = true; closeModal(); renderKeterangan();
    $('mapel').value = ''; $('status').value = '';
    alertBox({ icon: 'success', title: 'Absensi berhasil', text: 'Absensi Anda sudah tersimpan.', timer: 1500, showConfirmButton: false });
  });
}
init();
