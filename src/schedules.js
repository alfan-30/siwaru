import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;
const $ = (id) => document.getElementById(id);
const isAdminPage = location.pathname.toLowerCase().includes('editjadwaladmin');
let currentProfile = null;
let schedules = [];
let selectedId = null;
let channel = null;
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const notify = async (title, text, icon='info') => {
  if (window.Swal) return window.Swal.fire({title, text, icon, confirmButtonColor:'#2563eb'});
  window.alert(`${title}\n${text}`);
};
const dateDisplay = (value) => value ? String(value).slice(0,10) : '';
const fmtTime = (value) => String(value || '').replace(/\s/g,'').replace(/[.]/g,':');
const getTbody = () => document.querySelector('table tbody');

// Tailwind: jangan pasang `hidden` dan `flex` bersamaan. Tambahkan `flex` hanya saat modal dibuka.
function showModal(id) { const el = $(id); if (el) { el.classList.remove('hidden'); el.classList.add('flex'); el.setAttribute('aria-hidden', 'false'); } }
function hideModal(id) { const el = $(id); if (el) { el.classList.add('hidden'); el.classList.remove('flex'); el.setAttribute('aria-hidden', 'true'); } }

function fillDetail(s) {
  const values = [s.kode_jadwal, s.mata_pelajaran, s.guru, dateDisplay(s.tanggal), s.jam, s.ruang, s.kelas];
  ['detailKode','detailMapel','detailGuru','detailTanggal','detailJam','detailRuang','detailKelas'].forEach((id,i) => { if ($(id)) $(id).value = values[i] || ''; });
  showModal('detailModal');
}
window.openDetail = (kode) => { const s = schedules.find(x => String(x.id) === String(kode) || x.kode_jadwal === kode); if (s) fillDetail(s); };
window.closeDetail = () => hideModal('detailModal');
window.closeModal = (id) => hideModal(id);
window.closeAbsensiForm = () => hideModal('absensiModal');

function renderRows() {
  const body = getTbody(); if (!body) return;
  const term = ($('searchInput')?.value || '').toLowerCase();
  const visible = schedules.filter(s => [s.kode_jadwal,s.mata_pelajaran,s.guru,s.tanggal,s.jam,s.ruang,s.kelas].some(v => String(v || '').toLowerCase().includes(term)));
  if (!visible.length) { body.innerHTML = `<tr><td class="p-4 text-gray-500" colspan="9">${schedules.length ? 'Jadwal tidak ditemukan.' : 'Belum ada jadwal untuk ditampilkan.'}</td></tr>`; return; }
  body.innerHTML = visible.map((s,i) => `<tr class="border-b ${String(s.id)===String(selectedId)?'bg-blue-50':''}" data-id="${esc(s.id)}">
    <td class="p-4">${i+1}</td><td class="p-4 font-medium">${esc(s.kode_jadwal)}</td><td class="p-4">${esc(s.mata_pelajaran)}</td><td class="p-4">${esc(s.guru)}</td><td class="p-4">${esc(dateDisplay(s.tanggal))}</td><td class="p-4">${esc(s.jam)}</td><td class="p-4">${esc(s.ruang)}</td><td class="p-4">${esc(s.kelas)}</td>
    <td class="p-4 text-blue-600 cursor-pointer"><button type="button" data-detail="${esc(s.id)}" class="underline">Detail</button></td></tr>`).join('');
  body.querySelectorAll('tr[data-id]').forEach(row => row.addEventListener('click', e => { if (e.target.closest('[data-detail]')) { fillDetail(schedules.find(x=>String(x.id)===row.dataset.id)); return; } selectedId=row.dataset.id; renderRows(); }));
}

async function loadSchedules() {
  if (!supabase) { await notify('Supabase belum dikonfigurasi','Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY pada .env.local.','error'); return; }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) { await notify('Sesi tidak ditemukan','Silakan login kembali ke SIWARU.','warning'); return; }
  const { data: profile, error: profileError } = await supabase.from('profiles').select('id,nama,kelas,jabatan,nip_nis').eq('id',user.id).maybeSingle();
  if (profileError || !profile) { await notify('Profil tidak ditemukan','Periksa data profil pengguna di Supabase.','error'); return; }
  currentProfile = profile;
  const role = String(profile.jabatan || '').toLowerCase().replaceAll('_',' ').trim();
  if (isAdminPage && !['admin','administrator'].includes(role)) { await notify('Akses ditolak','Halaman ini hanya dapat digunakan Admin.','error'); return; }
  let query = supabase.from('schedules').select('id,kode_jadwal,mata_pelajaran,guru,tanggal,jam,ruang,kelas').order('tanggal',{ascending:true}).order('jam',{ascending:true});
  if (!isAdminPage) {
    if (['siswa'].includes(role)) query = query.eq('kelas', profile.kelas || '');
    else if (['guru','guru mapel','guru bk','gurubk'].includes(role)) query = query.ilike('guru', profile.nama || '');
    else { await notify('Akses ditolak','Akun ini tidak memiliki akses melihat jadwal.','error'); return; }
  }
  const { data, error } = await query;
  if (error) { await notify('Gagal memuat jadwal', error.message, 'error'); return; }
  schedules = data || []; renderRows();
  if (channel) await supabase.removeChannel(channel);
  channel = supabase.channel(`schedules-${user.id}-${isAdminPage?'admin':'user'}`)
    .on('postgres_changes',{event:'*',schema:'public',table:'schedules'},()=>loadRowsOnly())
    .subscribe();
}
async function loadRowsOnly() {
  let q = supabase.from('schedules').select('id,kode_jadwal,mata_pelajaran,guru,tanggal,jam,ruang,kelas').order('tanggal',{ascending:true}).order('jam',{ascending:true});
  if (!isAdminPage && currentProfile) {
    const role = String(currentProfile.jabatan || '').toLowerCase().replaceAll('_',' ').trim();
    q = role === 'siswa' ? q.eq('kelas',currentProfile.kelas || '') : q.ilike('guru',currentProfile.nama || '');
  }
  const {data,error}=await q; if (!error) { schedules=data||[]; renderRows(); }
}

function formFields(modalId) {
  const modal = $(modalId); const fields = modal?.querySelectorAll('form input, form select');
  if (!fields || fields.length < 7) return null;
  return [...fields].slice(0,7);
}
function formValues(modalId) {
  const f=formFields(modalId); if(!f) return null;
  return {kode_jadwal:f[0].value.trim(),mata_pelajaran:f[1].value.trim(),guru:f[2].value.trim(),tanggal:f[3].value,jam:f[4].value.trim(),ruang:f[5].value.trim(),kelas:f[6].value.trim()};
}
function validate(v) {
  if (!v || Object.values(v).some(x => !x)) return 'Semua kolom jadwal wajib diisi.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.tanggal)) return 'Tanggal tidak valid.';
  return '';
}
async function saveSchedule(modalId, id=null) {
  const v=formValues(modalId); const invalid=validate(v); if(invalid) return notify('Periksa data',invalid,'warning');
  const normalized={...v, jam:v.jam};
  const action = id ? supabase.from('schedules').update(normalized).eq('id',id) : supabase.from('schedules').insert(normalized);
  const {error}=await action;
  if(error) { await notify('Gagal menyimpan jadwal',error.message,'error'); return; }
  hideModal(modalId); selectedId=null; await loadRowsOnly(); await notify('Berhasil','Jadwal berhasil disimpan.','success');
}
window.openAbsensiForm = () => { const modal=$('absensiModal'); if(!modal) return; modal.querySelector('form')?.reset(); showModal('absensiModal'); };
window.openTambahForm = window.openAbsensiForm;
window.openUpdateForm = () => {
  if(!selectedId) return notify('Pilih jadwal','Klik salah satu baris jadwal terlebih dahulu.','warning');
  const s=schedules.find(x=>String(x.id)===String(selectedId)); if(!s) return;
  const f=formFields('modalEdit'); if(!f) return notify('Form tidak ditemukan','Periksa struktur formulir edit jadwal.','error');
  [s.kode_jadwal,s.mata_pelajaran,s.guru,dateDisplay(s.tanggal),s.jam,s.ruang,s.kelas].forEach((v,i)=>f[i].value=v||'');
  showModal('modalEdit');
};
window.confirmDelete = async () => {
  if(!selectedId) return notify('Pilih jadwal','Pilih baris jadwal yang ingin dihapus.','warning');
  const result = window.Swal ? await window.Swal.fire({title:'Hapus jadwal?',text:'Jadwal akan dihapus dari database dan tidak lagi tampil pada akun terkait.',icon:'warning',showCancelButton:true,confirmButtonText:'Ya, hapus',cancelButtonText:'Batal',confirmButtonColor:'#dc2626'}) : {isConfirmed:window.confirm('Hapus jadwal ini?')};
  if(!result.isConfirmed) return;
  const {error}=await supabase.from('schedules').delete().eq('id',selectedId);
  if(error) return notify('Gagal menghapus jadwal',error.message,'error');
  selectedId=null; await loadRowsOnly(); await notify('Berhasil','Jadwal berhasil dihapus.','success');
};

function wireAdminForms() {
  const addForm=$('absensiModal')?.querySelector('form');
  addForm?.addEventListener('submit',e=>{e.preventDefault();saveSchedule('absensiModal');});
  const editForm=$('modalEdit')?.querySelector('form');
  editForm?.addEventListener('submit',async e=>{e.preventDefault();
    const result=window.Swal?await window.Swal.fire({title:'Simpan perubahan?',text:'Data jadwal akan diperbarui.',icon:'question',showCancelButton:true,confirmButtonText:'Ya, update',cancelButtonText:'Batal'}):{isConfirmed:window.confirm('Simpan perubahan jadwal?')};
    if(result.isConfirmed) await saveSchedule('modalEdit',selectedId);
  });
}
function wireSidebar() {
  document.querySelectorAll('[data-toggle=sidebar]').forEach(btn=>btn.addEventListener('click',()=> $('sidebar')?.classList.toggle('-translate-x-full')));
  const burger=$('burger'), overlay=$('overlay');
  burger?.addEventListener('click',()=>{$('sidebar')?.classList.toggle('-translate-x-full');overlay?.classList.toggle('hidden');});
  overlay?.addEventListener('click',()=>{$('sidebar')?.classList.add('-translate-x-full');overlay?.classList.add('hidden');});
  $('searchInput')?.addEventListener('input',renderRows);
  $('bioToggle')?.addEventListener('click',()=>{$('submenuBio')?.classList.toggle('hidden');$('bioChevron')?.classList.toggle('rotate-180');});
}

wireSidebar();
if (isAdminPage) wireAdminForms();
loadSchedules();
window.addEventListener('beforeunload',()=>{if(channel && supabase) supabase.removeChannel(channel);});
