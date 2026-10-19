// Aturan jam absensi SIWARU (guru & siswa) — diubah cukup di file ini.
// Absensi dibuka 07:00 sampai 07:30 WIB. Mulai 07:31 absensi ditutup.
// Catatan: aturan yang sama juga dipaksa di database (supabase/schema.sql, fungsi
// enforce_attendance_rules), jadi mengubah jam di sini TIDAK cukup — ubah juga di SQL.
(function () {
  var BUKA = 7 * 60;          // 07:00
  var TUTUP = 7 * 60 + 30;    // 07:30 (sampai 07:30:59 masih terbuka; 07:31 tutup)

  // Jam & menit sekarang di zona WIB (tidak bergantung zona waktu perangkat).
  function sekarangWIB(date) {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).formatToParts(date || new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    return { jam: +o.hour, menit: +o.minute, detik: +o.second, teks: o.hour + '.' + o.minute + '.' + o.second };
  }

  // 'sebelum' (belum dibuka) | 'buka' | 'tutup'
  function status(date) {
    var w = sekarangWIB(date);
    var total = w.jam * 60 + w.menit;
    if (total < BUKA) return 'sebelum';
    if (total <= TUTUP) return 'buka';
    return 'tutup';
  }

  window.SIWARU_ABSENSI = {
    jamBuka: '07:00',
    jamTutup: '07:30',
    status: status,
    isOpen: function (date) { return status(date) === 'buka'; },
    clockText: function (date) { return sekarangWIB(date).teks; }
  };
})();
