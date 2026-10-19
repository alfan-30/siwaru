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
	
    // Modal
    function openDetail(kode, mapel, guru, tanggal, jam, ruang, kelas) {
      document.getElementById('detailKode').value = kode;
      document.getElementById('detailGuru').value = guru;
	  document.getElementById('detailMapel').value = mapel;
      document.getElementById('detailTanggal').value = tanggal;
      document.getElementById('detailJam').value = jam;
      document.getElementById('detailRuang').value = ruang;
      document.getElementById('detailKelas').value = kelas;
      document.getElementById('detailModal').classList.remove('hidden');
    }
    function closeDetail() {
      document.getElementById('detailModal').classList.add('hidden');
    }

    // Sidebar mobile toggle
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const burger = document.getElementById('burger');

    burger.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('hidden');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    });