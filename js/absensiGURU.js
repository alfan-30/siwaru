// Toggle sidebar di HP
	document.querySelectorAll("[data-toggle=sidebar]").forEach(btn => {
	  btn.addEventListener("click", () => {
		const sidebar = document.getElementById("sidebar");
		sidebar.classList.toggle("-translate-x-full");
	  });
	});

	// Klik luar sidebar untuk menutup (HP saja)
	document.addEventListener("click", (e) => {
	  const sidebar = document.getElementById("sidebar");
	  const toggleBtn = e.target.closest("[data-toggle=sidebar]");
	  if (!sidebar.contains(e.target) && !toggleBtn && window.innerWidth < 768) {
		sidebar.classList.add("-translate-x-full");
	  }
	});
	
	// Fungsi search filter
	document.getElementById("searchInput").addEventListener("input", function () {
	  const filter = this.value.toLowerCase(); // ambil keyword
	  const rows = document.querySelectorAll("table tbody tr");

	  rows.forEach(row => {
		const text = row.innerText.toLowerCase();
		row.style.display = text.includes(filter) ? "" : "none";
	  });
	});
	
    // Sidebar mobile (overlay) - elemen opsional, jangan error bila tidak ada
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const burgerBtn = document.getElementById('burgerBtn');

    if (burgerBtn) burgerBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      if (overlay) overlay.classList.toggle('hidden');
    });

    if (overlay) overlay.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    });

    // Modal Absensi
    function openAbsensiForm() {
      document.getElementById('absensiModal').classList.remove('hidden'); document.getElementById('absensiModal').classList.add('flex');
      updateWaktuAbsensi();
    }
    function closeAbsensiForm() {
      document.getElementById('absensiModal').classList.remove('flex'); document.getElementById('absensiModal').classList.add('hidden');
    }

    // Modal Detail
    function openDetail(nama, nis, mapel, jam, tanggal, status) {
      document.getElementById('detailNama').value = nama;
      document.getElementById('detailNis').value = nis;
      document.getElementById('detailMapel').value = mapel;
	  document.getElementById('detailJam').value = jam;
      document.getElementById('detailTanggal').value = tanggal;
      document.getElementById('detailStatus').value = status;
      document.getElementById('detailModal').classList.remove('hidden'); document.getElementById('detailModal').classList.add('flex');
    }
    function closeDetail() {
      document.getElementById('detailModal').classList.remove('flex'); document.getElementById('detailModal').classList.add('hidden');
    }

    // === Jam & tombol SIMPAN mengikuti jam absensi ===
    // Absensi dibuka 07:00 - 07:30 WIB, mulai 07:31 ditutup (aturan di js/absensi-config.js).
    function updateWaktuAbsensi() {
      const btnSimpan = document.getElementById('btnSimpan');
      const waktuDisplay = document.getElementById('waktuDisplay');
      const jadwal = window.SIWARU_ABSENSI;
      const status = jadwal.status();

      waktuDisplay.textContent = jadwal.clockText();

      let info = document.getElementById('absensiInfo');
      if (!info) {
        info = document.createElement('p');
        info.id = 'absensiInfo';
        info.className = 'text-sm font-medium';
        btnSimpan.closest('div').parentNode.insertBefore(info, btnSimpan.closest('div'));
      }

      if (status === 'buka') {
        btnSimpan.disabled = false;
        btnSimpan.classList.remove('opacity-50', 'cursor-not-allowed');
        waktuDisplay.style.color = 'green';
        info.style.color = 'green';
        info.textContent = 'Absensi dibuka sampai pukul ' + jadwal.jamTutup + ' WIB.';
      } else {
        btnSimpan.disabled = true;
        btnSimpan.classList.add('opacity-50', 'cursor-not-allowed');
        waktuDisplay.style.color = status === 'tutup' ? 'red' : 'gray';
        info.style.color = status === 'tutup' ? 'red' : 'gray';
        info.textContent = status === 'tutup'
          ? 'Absensi ditutup. Absensi dibuka pukul ' + jadwal.jamBuka + ' - ' + jadwal.jamTutup + ' WIB.'
          : 'Absensi belum dibuka. Absensi dibuka pukul ' + jadwal.jamBuka + ' - ' + jadwal.jamTutup + ' WIB.';
      }
    }
    setInterval(updateWaktuAbsensi, 1000);
    window.addEventListener('load', updateWaktuAbsensi);
