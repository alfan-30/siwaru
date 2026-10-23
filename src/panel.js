import { createClient } from '@supabase/supabase-js';

// Modul bersama untuk halaman Admin & Guru Mapel. Halaman memilih perilaku lewat
// <body data-page="..." data-role="admin|guru">.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;

const PAGE = document.body.dataset.page;
const ROLE = document.body.dataset.role; // 'admin' | 'guru'
const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (r) => String(r || '').toLowerCase().replaceAll('_', ' ').trim();

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const tglPanjang = (iso) => { const [y, m, d] = String(iso || '').slice(0, 10).split('-'); return d ? `${+d} ${BULAN[+m - 1]} ${y}` : ''; };
const jamPendek = (t) => String(t || '').slice(0, 5).replace('.', ':');
const tglJam = (iso, jam) => { const t = tglPanjang(iso); const j = jamPendek(jam); return t ? (j ? `${t} Pukul ${j}` : t) : '-'; };
const todayWIB = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

const STATUS = {
  masuk: ['Datang Tepat Waktu', 'bg-green-100 text-green-800'],
  hadir: ['Datang Tepat Waktu', 'bg-green-100 text-green-800'],
  terlambat: ['Terlambat', 'bg-red-100 text-red-800'],
  izin: ['Izin', 'bg-yellow-100 text-yellow-800'],
  sakit: ['Sakit', 'bg-yellow-100 text-yellow-800'],
  alpa: ['Alpa', 'bg-red-100 text-red-800'],
};
const statusInfo = (s) => STATUS[String(s || '').toLowerCase()] || [s || '-', 'bg-gray-100 text-gray-800'];
const badge = (s) => { const [t, c] = statusInfo(s); return `<span class="inline-block px-3 py-1 rounded-full text-sm font-semibold ${c}">${esc(t)}</span>`; };

const notify = (title, text, icon = 'info') => window.Swal
  ? window.Swal.fire({ title, text, icon, confirmButtonColor: '#2563eb' })
  : Promise.resolve(window.alert(`${title}\n${text}`));
const ask = async (title, text, confirmText = 'Ya', color = '#dc2626') => {
  if (!window.Swal) return window.confirm(`${title}\n${text}`);
  const r = await window.Swal.fire({ title, text, icon: 'warning', showCancelButton: true, confirmButtonText: confirmText, cancelButtonText: 'Batal', confirmButtonColor: color });
  return r.isConfirmed;
};

/* ---------- Modal generik ---------- */
function modal(html) {
  const wrap = document.createElement('div');
  wrap.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4';
  wrap.innerHTML = `<div class="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6">${html}</div>`;
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) close(); });
  return { wrap, close };
}
function fieldHtml(f, value) {
  const base = 'mt-1 w-full border rounded-lg px-3 py-2';
  const v = value ?? '';
  const id = `f_${f.name}`;
  const attrs = `id="${id}" name="${f.name}" ${f.readonly ? 'readonly' : ''} ${f.required ? 'required' : ''} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''} ${f.maxlength ? `maxlength="${f.maxlength}"` : ''} ${f.inputmode ? `inputmode="${f.inputmode}"` : ''}`;
  let input;
  if (f.type === 'select') input = `<select ${attrs} class="${base} bg-white"><option value="">${esc(f.placeholder || 'Pilih')}</option>${f.options.map(o => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`; }).join('')}</select>`;
  else if (f.type === 'password') input = `<input ${attrs} type="password" autocomplete="new-password" class="${base}" value=""/>`;
  else input = `<input ${attrs} type="${f.type || 'text'}" ${f.list ? `list="dl_${f.name}"` : ''} class="${base} ${f.readonly ? 'bg-gray-100' : ''}" value="${esc(v)}"/>${f.list ? `<datalist id="dl_${f.name}">${f.list.map(x => `<option value="${esc(x)}"></option>`).join('')}</datalist>` : ''}`;
  return `<div><label class="block text-sm font-medium" for="${id}">${esc(f.label)}</label>${input}${f.hint ? `<p class="text-xs text-gray-500 mt-1">${esc(f.hint)}</p>` : ''}</div>`;
}
// Form tambah/edit. onSubmit(values) -> string error | null (null = tutup form)
function openForm({ title, fields, values = {}, submitText = 'Simpan', onSubmit }) {
  const { wrap, close } = modal(`<h3 class="text-lg font-semibold mb-4">${esc(title)}</h3>
    <form class="space-y-4" novalidate>${fields.map(f => fieldHtml(f, values[f.name])).join('')}
    <div class="flex justify-end space-x-3 pt-4"><button type="button" data-cancel class="px-4 py-2 rounded-lg border">Batal</button>
    <button type="submit" class="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">${esc(submitText)}</button></div></form>`);
  const form = wrap.querySelector('form');
  wrap.querySelector('[data-cancel]').onclick = close;
  fields.filter(f => f.digits).forEach(f => $(`f_${f.name}`).addEventListener('input', e => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const out = {}; fields.forEach(f => { out[f.name] = f.type === 'password' ? $(`f_${f.name}`).value : $(`f_${f.name}`).value.trim(); });
    const btn = form.querySelector('[type=submit]'); btn.disabled = true; btn.classList.add('opacity-60');
    const err = await onSubmit(out);
    if (err) { btn.disabled = false; btn.classList.remove('opacity-60'); await notify('Periksa data', err, 'warning'); return; }
    close();
  });
}
function openDetail(title, pairs) {
  const { wrap, close } = modal(`<h3 class="text-lg font-semibold mb-4">${esc(title)}</h3><div class="space-y-4">${pairs.map(([l, v]) =>
    `<div><label class="block text-sm font-medium">${esc(l)}</label><input readonly class="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50" value="${esc(v || '-')}"/></div>`).join('')}
    <div class="flex justify-end pt-2"><button type="button" data-cancel class="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600">Tutup</button></div></div>`);
  wrap.querySelector('[data-cancel]').onclick = close;
}

/* ---------- Tabel ---------- */
const aksiBtn = (kind, id) => {
  const map = { view: ['bg-purple-500 hover:bg-purple-600', 'visibility', 'Detail'], edit: ['bg-green-500 hover:bg-green-600', 'update', 'Edit'], del: ['bg-red-500 hover:bg-red-600', 'delete', 'Hapus'] };
  const [c, i, t] = map[kind];
  return `<button type="button" data-act="${kind}" data-id="${esc(id)}" title="${t}" class="${c} text-white w-11 h-10 inline-flex items-center justify-center first:rounded-l-lg last:rounded-r-lg"><span class="material-symbols-outlined text-xl">${i}</span></button>`;
};
const aksiGroup = (id, kinds) => `<div class="inline-flex shadow-md rounded-lg">${kinds.map(k => aksiBtn(k, id)).join('')}</div>`;

// Menampilkan baris pada <tbody id="tbody">, mendukung pencarian #searchInput.
function table({ rows, cells, kinds = [], searchText, onAction, empty = 'Belum ada data.' }) {
  const body = $('tbody'); const search = $('searchInput');
  const draw = () => {
    const term = (search?.value || '').toLowerCase();
    const shown = rows.filter(r => !term || searchText(r).toLowerCase().includes(term));
    if (!shown.length) { body.innerHTML = `<tr><td colspan="20" class="p-6 text-gray-500">${rows.length ? 'Data tidak ditemukan.' : empty}</td></tr>`; return; }
    body.innerHTML = shown.map((r, i) => `<tr class="border-b"><td class="p-4">${i + 1}</td>${cells(r).map((c, j) => `<td class="p-4 ${j === 0 ? 'font-semibold' : ''}">${c}</td>`).join('')}${kinds.length ? `<td class="p-3">${aksiGroup(r.id, kinds)}</td>` : ''}</tr>`).join('');
  };
  if (search && !search._bound) { search.addEventListener('input', draw); search._bound = true; }
  if (!body._bound) {
    body.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (!b) return; const row = body._rows.find(r => String(r.id) === b.dataset.id); if (row) body._onAction(b.dataset.act, row); });
    body._bound = true;
  }
  body._rows = rows; body._onAction = onAction; draw();
}
const rpcError = (e) => (e?.message || 'Terjadi kesalahan').replace(/^.*?exception:\s*/i, '');

/* ---------- Auth & kerangka halaman ---------- */
const ROLE_LABEL = (r) => (['admin', 'administrator'].includes(norm(r)) ? 'Admin' : norm(r) === 'siswa' ? 'Siswa' : 'Guru Mapel');
const HOME = (r) => { r = norm(r); return r === 'admin' || r === 'administrator' ? 'DashboardADMIN.html' : r === 'siswa' ? 'absensiSISWA.html' : 'DashboardGURU.html'; };
let me = null;

async function guard() {
  if (!supabase) { await notify('Supabase belum dikonfigurasi', 'Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY pada .env.local.', 'error'); return false; }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { await notify('Silakan login', 'Anda harus login untuk membuka halaman ini.', 'warning'); location.href = 'login.html'; return false; }
  const { data: p } = await supabase.from('profiles').select('id,nip_nis,nama,kelas,jabatan,no_tlp').eq('id', session.user.id).maybeSingle();
  if (!p) { await notify('Profil tidak ditemukan', 'Periksa data profil pengguna di Supabase.', 'error'); return false; }
  const r = norm(p.jabatan);
  const ok = ROLE === 'admin' ? ['admin', 'administrator'].includes(r) : ['guru', 'guru mapel'].includes(r);
  if (!ok) { await notify('Akses ditolak', 'Akun ini tidak dapat membuka halaman tersebut.', 'error'); location.href = HOME(p.jabatan); return false; }
  me = p;
  document.querySelectorAll('[data-fill=nama]').forEach(el => el.textContent = p.nama);
  document.querySelectorAll('[data-fill=role]').forEach(el => el.textContent = ROLE_LABEL(p.jabatan));
  return true;
}
function shell() {
  const sb = $('sidebar'), ov = $('overlay');
  const toggle = () => { sb.classList.toggle('-translate-x-full'); ov.classList.toggle('hidden'); };
  if (PAGE !== 'profile-guru') { // halaman profil guru sudah punya handler burger sendiri (js/profileGURU.js)
    $('burgerBtn')?.addEventListener('click', toggle);
    ov?.addEventListener('click', toggle);
  }
  $('dataToggle')?.addEventListener('click', () => { $('dataSub').classList.toggle('hidden'); $('dataChevron').textContent = $('dataSub').classList.contains('hidden') ? 'expand_more' : 'expand_less'; });
  $('btnLogout')?.addEventListener('click', async (e) => { e.preventDefault(); try { await supabase?.auth.signOut(); } finally { location.href = 'login.html'; } });
  $('btnPrint')?.addEventListener('click', () => window.print());
}

/* ---------- Halaman ---------- */
const count = async (table, build) => { let q = supabase.from(table).select('*', { count: 'exact', head: true }); if (build) q = build(q); const { count: n, error } = await q; return error ? '—' : (n ?? 0); };

async function dashboard() {
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  if (ROLE === 'admin') {
    const { data: profs } = await supabase.from('profiles').select('jabatan');
    const list = profs || [];
    set('cJadwal', await count('schedules'));
    set('cGuru', list.filter(p => ['guru', 'guru mapel'].includes(norm(p.jabatan))).length);
    set('cSiswa', list.filter(p => norm(p.jabatan) === 'siswa').length);
    set('cMapel', await count('subjects'));
    set('cKelas', await count('classes'));
  } else {
    set('cJadwal', await count('schedules'));
    set('cAbsensi', await count('attendance', q => q.eq('tanggal', todayWIB()).eq('peran', 'siswa')));
  }
}

/* --- Data Guru / Siswa --- */
// Daftar kelas sama persis dengan dropdown di halaman registrasi (js/registrasi.js)
const KELAS_REGISTRASI = ['10 TKJ 1', '10 MM 1', '10 TITL 1', '10 TPM 1'];
const GURU_ROLES = ['guru', 'guru mapel'];
async function akunPage(kind) {
  const isGuru = kind === 'guru';
  const [{ data: profs, error }, { data: kelas }, { data: secrets }] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: true }),
    supabase.from('classes').select('nama_kelas').order('nama_kelas'),
    supabase.from('account_secrets').select('user_id,password_plain'),
  ]);
  const pwOf = Object.fromEntries((secrets || []).map(x => [x.user_id, x.password_plain]));
  // Password disamarkan; klik ikon mata untuk melihat. Akun lama / daftar sendiri belum punya salinan.
  const pwCell = (r) => pwOf[r.id]
    ? `<span class="inline-flex items-center gap-1"><span data-pw-text="${esc(pwOf[r.id])}" class="font-mono">••••••••</span><button type="button" data-pw-eye class="text-gray-500 hover:text-gray-800"><span class="material-symbols-outlined text-lg">visibility</span></button></span>`
    : '<span class="text-gray-400" title="Belum tersimpan. Isi Password Baru lewat tombol edit.">—</span>';
  const tb = $('tbody');
  if (tb && !tb._pwBound) {
    tb.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pw-eye]'); if (!b) return;
      const t = b.parentElement.querySelector('[data-pw-text]'); const show = t.textContent.startsWith('•');
      t.textContent = show ? t.dataset.pwText : '••••••••'; b.querySelector('span').textContent = show ? 'visibility_off' : 'visibility';
    });
    tb._pwBound = true;
  }
  if (error) return notify('Gagal memuat data', error.message, 'error');
  const rows = (profs || []).filter(p => isGuru ? GURU_ROLES.includes(norm(p.jabatan)) : norm(p.jabatan) === 'siswa');
  const kelasList = (kelas || []).map(k => k.nama_kelas);
  const idLabel = isGuru ? 'NIP/NPPTK' : 'NIS';

  const fields = (editing) => [
    { name: 'nip_nis', label: isGuru ? 'NIP' : 'NIS', required: true, digits: true, inputmode: 'numeric', placeholder: isGuru ? 'Diawali 12' : 'Diawali 14' },
    { name: 'nama', label: 'Nama', required: true },
    ...(isGuru ? []
      : [{ name: 'kelas', label: 'Kelas', required: true, list: kelasList, placeholder: 'Contoh: 1 TKJ 2' }]),
    { name: 'no_tlp', label: 'No. Telepon', digits: true, inputmode: 'numeric', maxlength: 12, required: true },
    { name: 'alamat', label: 'Alamat', required: true },
    { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', required: true, placeholder: 'Pilih Jenis Kelamin', options: ['Laki-laki', 'Perempuan'] },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: editing ? 'Password Baru' : 'Password', type: 'password', required: !editing, hint: editing ? 'Kosongkan jika password tidak diubah.' : 'Minimal 8 karakter, mengandung huruf dan angka.' },
  ];
  const validate = (v, editing) => {
    if (!v.nip_nis || !v.nama || !v.no_tlp || !v.alamat || !v.jenis_kelamin || !v.email || (!isGuru && !v.kelas)) return 'Semua kolom wajib diisi.';
    if (isGuru && !v.nip_nis.startsWith('12')) return 'NIP guru harus diawali 12.';
    if (!isGuru && !v.nip_nis.startsWith('14')) return 'NIS siswa harus diawali 14.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return 'Email tidak valid.';
    if (!editing && !v.password) return 'Password wajib diisi.';
    if (v.password && !/^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/.test(v.password)) return 'Password minimal 8 karakter dan harus mengandung huruf serta angka.';
    return '';
  };
  const args = (v, id) => ({ ...(id ? { p_id: id } : {}), p_nip: v.nip_nis, p_nama: v.nama, p_jabatan: isGuru ? 'guru' : 'siswa', p_kelas: isGuru ? null : v.kelas, p_no_tlp: v.no_tlp, p_alamat: v.alamat, p_jenis_kelamin: v.jenis_kelamin, p_email: v.email });
  const reload = () => akunPage(kind);

  table({
    rows, kinds: ['view', 'edit', 'del'],
    // Kolom mengikuti isian form registrasi (NIP/NIS, nama, kelas, jabatan, telepon, alamat, jenis kelamin, email)
    cells: r => isGuru
      ? [esc(r.nip_nis), esc(r.nama), esc(ROLE_LABEL(r.jabatan)), esc(r.no_tlp), esc(r.alamat), esc(r.jenis_kelamin), esc(r.email), pwCell(r)]
      : [esc(r.nip_nis), esc(r.nama), esc(r.kelas), esc(r.no_tlp), esc(r.alamat), esc(r.jenis_kelamin), esc(r.email), pwCell(r)],
    searchText: r => [r.nip_nis, r.nama, r.no_tlp, r.alamat, r.jenis_kelamin, r.email, r.kelas].join(' '),
    empty: isGuru ? 'Belum ada data guru.' : 'Belum ada data siswa.',
    onAction: (act, r) => {
      if (act === 'view') return openDetail(`Detail Data ${isGuru ? 'Guru' : 'Siswa'}`, [[idLabel, r.nip_nis], ['Nama', r.nama], isGuru ? ['Jabatan', ROLE_LABEL(r.jabatan)] : ['Kelas', r.kelas], ['No. Telepon', r.no_tlp], ['Alamat', r.alamat], ['Jenis Kelamin', r.jenis_kelamin], ['Email', r.email]]);
      if (act === 'edit') return openForm({
        title: `Edit Data ${isGuru ? 'Guru' : 'Siswa'}`, fields: fields(true), values: r,
        onSubmit: async (v) => { const bad = validate(v, true); if (bad) return bad; const { error: e } = await supabase.rpc('admin_update_user', { ...args(v, r.id), p_password: v.password || null }); if (e) return rpcError(e); await reload(); notify('Berhasil', 'Data akun berhasil diperbarui.', 'success'); return null; },
      });
      if (act === 'del') return ask('Hapus akun?', `Akun ${r.nama} (${r.nip_nis}) akan dihapus permanen dan tidak bisa login lagi.`, 'Ya, hapus').then(async ok => {
        if (!ok) return; const { error: e } = await supabase.rpc('admin_delete_user', { p_id: r.id });
        if (e) return notify('Gagal menghapus', rpcError(e), 'error'); await reload(); notify('Terhapus', 'Akun berhasil dihapus.', 'success');
      });
    },
  });
  const add = $('btnAdd'); if (add) add.onclick = () => openForm({
    title: `Tambah Akun ${isGuru ? 'Guru' : 'Siswa'}`, fields: fields(false),
    onSubmit: async (v) => { const bad = validate(v, false); if (bad) return bad; const { error: e } = await supabase.rpc('admin_create_user', { ...args(v), p_password: v.password }); if (e) return rpcError(e); await reload(); notify('Berhasil', 'Akun berhasil dibuat. Pengguna bisa login memakai NIP/NIS dan password tersebut.', 'success'); return null; },
  });
}

/* --- Kelas & Mapel --- */
async function kelasPage() {
  const { data, error } = await supabase.from('classes').select('*').order('nama_kelas');
  if (error) return notify('Gagal memuat kelas', error.message, 'error');
  const f = [{ name: 'nama_kelas', label: 'Nama Kelas', required: true, placeholder: 'Contoh: 1 TKJ 2' }];
  const save = (id) => async (v) => { if (!v.nama_kelas) return 'Nama kelas wajib diisi.'; const { error: e } = id ? await supabase.from('classes').update({ nama_kelas: v.nama_kelas }).eq('id', id) : await supabase.from('classes').insert({ nama_kelas: v.nama_kelas }); if (e) return e.code === '23505' ? 'Nama kelas sudah ada.' : e.message; await kelasPage(); return null; };
  table({
    rows: data || [], kinds: ['view', 'edit', 'del'], cells: r => [esc(r.nama_kelas)], searchText: r => r.nama_kelas, empty: 'Belum ada kelas.',
    onAction: (act, r) => {
      if (act === 'view') return openDetail('Detail Kelas', [['Nama Kelas', r.nama_kelas]]);
      if (act === 'edit') return openForm({ title: 'Edit Kelas', fields: f, values: r, onSubmit: save(r.id) });
      ask('Hapus kelas?', `Kelas ${r.nama_kelas} akan dihapus.`, 'Ya, hapus').then(async ok => { if (!ok) return; const { error: e } = await supabase.from('classes').delete().eq('id', r.id); if (e) return notify('Gagal menghapus', e.message, 'error'); kelasPage(); });
    },
  });
  $('btnAdd').onclick = () => openForm({ title: 'Tambah Kelas', fields: f, onSubmit: save(null) });
}
async function mapelPage() {
  const { data, error } = await supabase.from('subjects').select('*').order('kode_mapel', { nullsFirst: false }).order('nama_mapel');
  if (error) return notify('Gagal memuat mata pelajaran', error.message, 'error');
  const rows = data || [];
  const nextKode = () => { const n = Math.max(0, ...rows.map(r => parseInt(String(r.kode_mapel || '').replace(/\D/g, ''), 10) || 0)) + 1; return 'MP' + String(n).padStart(3, '0'); };
  const f = [{ name: 'kode_mapel', label: 'Kode Mata Pelajaran', required: true }, { name: 'nama_mapel', label: 'Nama Mata Pelajaran', required: true }];
  const save = (id) => async (v) => { if (!v.kode_mapel || !v.nama_mapel) return 'Kode dan nama mata pelajaran wajib diisi.'; const p = { kode_mapel: v.kode_mapel.toUpperCase(), nama_mapel: v.nama_mapel }; const { error: e } = id ? await supabase.from('subjects').update(p).eq('id', id) : await supabase.from('subjects').insert(p); if (e) return e.code === '23505' ? 'Kode atau nama mata pelajaran sudah ada.' : e.message; await mapelPage(); return null; };
  table({
    rows, kinds: ['view', 'edit', 'del'], cells: r => [esc(r.kode_mapel || '-'), esc(r.nama_mapel)], searchText: r => `${r.kode_mapel} ${r.nama_mapel}`, empty: 'Belum ada mata pelajaran.',
    onAction: (act, r) => {
      if (act === 'view') return openDetail('Detail Mata Pelajaran', [['Kode Mata Pelajaran', r.kode_mapel], ['Nama Mata Pelajaran', r.nama_mapel]]);
      if (act === 'edit') return openForm({ title: 'Edit Mata Pelajaran', fields: f, values: r, onSubmit: save(r.id) });
      ask('Hapus mata pelajaran?', `${r.nama_mapel} akan dihapus.`, 'Ya, hapus').then(async ok => { if (!ok) return; const { error: e } = await supabase.from('subjects').delete().eq('id', r.id); if (e) return notify('Gagal menghapus', e.message, 'error'); mapelPage(); });
    },
  });
  $('btnAdd').onclick = () => openForm({ title: 'Tambah Mata Pelajaran', fields: f, values: { kode_mapel: nextKode() }, onSubmit: save(null) });
}

/* --- Jadwal (admin: CRUD, guru: lihat jadwal sendiri) --- */
async function jadwalPage() {
  const isAdmin = ROLE === 'admin';
  const { data, error } = await supabase.from('schedules').select('id,kode_jadwal,mata_pelajaran,guru,tanggal,jam,ruang,kelas').order('tanggal', { ascending: true }).order('jam', { ascending: true });
  if (error) return notify('Gagal memuat jadwal', error.message, 'error');
  const rows = data || [];
  let mapel = [], guru = [];
  if (isAdmin) {
    const [a, c] = await Promise.all([supabase.from('subjects').select('nama_mapel'), supabase.from('profiles').select('nama,jabatan')]);
    mapel = (a.data || []).map(x => x.nama_mapel);
    guru = (c.data || []).filter(p => GURU_ROLES.includes(norm(p.jabatan))).map(p => p.nama);
  }
  // Kelas berupa dropdown; kelas lama yang tidak ada di daftar tetap ditampilkan agar tidak hilang saat edit.
  const fields = (cur = '') => [
    { name: 'kode_jadwal', label: 'Kode Jadwal', required: true },
    { name: 'mata_pelajaran', label: 'Mata Pelajaran', required: true, list: mapel },
    { name: 'guru', label: 'Guru', required: true, list: guru },
    { name: 'tanggal', label: 'Tanggal', type: 'date', required: true },
    { name: 'jam', label: 'Jam', required: true, placeholder: 'Contoh: 08:10' },
    { name: 'ruang', label: 'Ruang', required: true },
    { name: 'kelas', label: 'Kelas', type: 'select', required: true, placeholder: '-- Pilih Kelas --', options: cur && !KELAS_REGISTRASI.includes(cur) ? [cur, ...KELAS_REGISTRASI] : KELAS_REGISTRASI },
  ];
  const save = (id) => async (v) => {
    if (Object.values(v).some(x => !x)) return 'Semua kolom jadwal wajib diisi.';
    const { error: e } = id ? await supabase.from('schedules').update(v).eq('id', id) : await supabase.from('schedules').insert(v);
    if (e) return e.code === '23505' ? 'Kode jadwal sudah dipakai.' : e.message;
    await jadwalPage(); return null;
  };
  const detail = (r) => openDetail('Detail Jadwal', [['Kode Jadwal', r.kode_jadwal], ['Mata Pelajaran', r.mata_pelajaran], ['Guru', r.guru], ['Tanggal', tglPanjang(r.tanggal)], ['Jam', r.jam], ['Ruang', r.ruang], ['Kelas', r.kelas]]);
  table({
    rows, kinds: isAdmin ? ['view', 'edit', 'del'] : ['view'],
    cells: r => [esc(r.kode_jadwal), esc(r.guru), esc(r.kelas), esc(r.mata_pelajaran), esc(tglJam(r.tanggal, r.jam))],
    searchText: r => [r.kode_jadwal, r.guru, r.kelas, r.mata_pelajaran, r.ruang, tglJam(r.tanggal, r.jam)].join(' '),
    empty: 'Belum ada jadwal untuk ditampilkan.',
    onAction: (act, r) => {
      if (act === 'view') return detail(r);
      if (act === 'edit') return openForm({ title: 'Edit Jadwal', fields: fields(r.kelas), values: { ...r, tanggal: String(r.tanggal || '').slice(0, 10) }, onSubmit: save(r.id) });
      ask('Hapus jadwal?', `Jadwal ${r.kode_jadwal} akan dihapus.`, 'Ya, hapus').then(async ok => { if (!ok) return; const { error: e } = await supabase.from('schedules').delete().eq('id', r.id); if (e) return notify('Gagal menghapus', e.message, 'error'); jadwalPage(); });
    },
  });
  if (isAdmin && $('btnAdd')) $('btnAdd').onclick = () => {
    const d = new Date(); const kode = `JAD${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getFullYear()).slice(2)}-${rows.length + 1}`;
    openForm({ title: 'Tambah Jadwal', fields: fields(), values: { kode_jadwal: kode }, onSubmit: save(null) });
  };
}

/* --- Absensi & Laporan (daftar absensi siswa) --- */
async function absensiPage() {
  const [{ data, error }, { data: profs }] = await Promise.all([
    supabase.from('attendance').select('id,nama_siswa,nis,mata_pelajaran,tanggal,waktu,status,alasan,peran').eq('peran', 'siswa').order('tanggal', { ascending: false }).order('waktu', { ascending: false }).limit(1000),
    supabase.from('profiles').select('nip_nis,kelas'),
  ]);
  if (error) return notify('Gagal memuat absensi', error.message, 'error');
  const kelasOf = Object.fromEntries((profs || []).map(p => [p.nip_nis, p.kelas]));
  const all = (data || []).map(r => ({ ...r, kelas: kelasOf[r.nis] || '-' }));
  const filter = $('filterSelect');
  const current = () => {
    const f = filter?.value || 'all';
    if (f === 'all') return all;
    if (f === 'today') return all.filter(r => r.tanggal === todayWIB());
    if (f === 'masuk') return all.filter(r => ['masuk', 'hadir'].includes(String(r.status).toLowerCase()));
    return all.filter(r => String(r.status).toLowerCase() === f);
  };
  const render = () => table({
    rows: current(), kinds: ['view'],
    cells: r => [esc(r.nama_siswa), esc(r.kelas), esc(tglJam(r.tanggal, r.waktu)), badge(r.status)].map((c, i) => i === 0 ? c : c),
    searchText: r => [r.nama_siswa, r.nis, r.kelas, tglJam(r.tanggal, r.waktu), statusInfo(r.status)[0]].join(' '),
    empty: 'Belum ada data absensi.',
    onAction: (act, r) => openDetail('Detail Absensi', [['Nama', r.nama_siswa], ['Nomor Induk Siswa', r.nis], ['Kelas', r.kelas], ['Mata Pelajaran', r.mata_pelajaran], ['Tanggal', tglPanjang(r.tanggal)], ['Jam', jamPendek(r.waktu)], ['Status', statusInfo(r.status)[0]], ['Keterangan', r.alasan]]),
  });
  if (filter && !filter._bound) { filter.addEventListener('change', render); filter._bound = true; }
  render();
}

const PAGES = {
  'dashboard-admin': dashboard, 'dashboard-guru': dashboard,
  'guru-data': () => akunPage('guru'), 'siswa-data': () => akunPage('siswa'),
  kelas: kelasPage, mapel: mapelPage, 'jadwal-admin': jadwalPage, 'jadwal-guru': jadwalPage,
  'absensi-admin': absensiPage, 'absensi-guru': absensiPage, laporan: absensiPage, 'profile-guru': async () => {},
};

shell();
if (!['guru-data', 'siswa-data'].includes(PAGE)) { /* submenu Data tetap tertutup */ } else { $('dataSub')?.classList.remove('hidden'); if ($('dataChevron')) $('dataChevron').textContent = 'expand_less'; }
if (['kelas', 'mapel'].includes(PAGE)) { $('dataSub')?.classList.remove('hidden'); if ($('dataChevron')) $('dataChevron').textContent = 'expand_less'; }
guard().then(ok => { if (ok) PAGES[PAGE]?.(); });
