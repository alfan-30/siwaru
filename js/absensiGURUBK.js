// === JAM REALTIME TANPA TANGGAL ===
    function updateClock() {
	  const clock = document.getElementById("clock");
	  const now = new Date();
	  const jam = now.getHours();
	  const menit = now.getMinutes();
	  const detik = String(now.getSeconds()).padStart(2, '0');
	  const totalMenit = jam * 60 + menit;

	  // Tampilkan waktu real-time (format 2 digit)
	  clock.textContent = `${String(jam).padStart(2, '0')}.${String(menit).padStart(2, '0')}.${detik}`;

	  // Konversi waktu penting ke menit
	  const startAbuPagi = 6 * 60 + 30;  // 06:30
	  const startMerahPagi = 7 * 60 + 20; // 07:20
	  const startAbuSiang = 12 * 60 + 5;  // 12:05
	  const endAbuSiang = 12 * 60 + 15;   // 12:15
	  const startAbuPagiBesok = 6 * 60 + 30; // 06:30 (besok)

	  let warna = "red"; // default merah

	  // === Logika warna ===
	  if (
		(totalMenit >= startAbuPagi && totalMenit < startMerahPagi) || // 06:30–07:20
		(totalMenit >= startAbuSiang && totalMenit < endAbuSiang)      // 12:05–12:15
	  ) {
		warna = "gray"; // abu-abu
	  } else if (totalMenit < startAbuPagi) {
		// Setelah jam 12:15 siang hingga sebelum 06:30 besok → merah
		warna = "red";
	  } else if (totalMenit >= endAbuSiang && totalMenit < startAbuPagiBesok) {
		warna = "red";
	  }

	  // Terapkan warna ke jam
	  clock.style.color = warna;
	}

	// Jalankan setiap detik
	setInterval(updateClock, 1000);
	updateClock();

    // === FITUR SEARCH BAR ===
    document.getElementById("searchInput").addEventListener("input", function() {
      const searchValue = this.value.toLowerCase();
      const rows = document.querySelectorAll("#absensiTable tbody tr");
      rows.forEach(row => {
        const nama = row.cells[1].textContent.toLowerCase();
        row.style.display = nama.includes(searchValue) ? "" : "none";
      });
    });

    // === SCRIPT LAINNYA ===
    let selectedRow = null;
    document.querySelectorAll("#absensiTable tbody tr").forEach(row => {
      row.addEventListener("click", () => {
        document.querySelectorAll("#absensiTable tbody tr").forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");
        selectedRow = row;
      });
    });

			function handleUbahClick() {
		  if (!selectedRow) {
			Swal.fire({
			  icon: "warning",
			  title: "Peringatan",
			  text: "Silakan pilih baris data dulu!",
			  confirmButtonText: "OK",
			  confirmButtonColor: "#7C3AED",
			});
			return;
		  }

		  // Ambil data dari kolom tabel
		  const nama = selectedRow.cells[1].innerText;   // kolom Nama
		  const nis = selectedRow.cells[2].innerText;  // kolom Kelas

		  // Isi otomatis ke form modal
		  document.getElementById("ubahNama").value = nama;
		  document.getElementById("ubahNis").value = nis;

		  // Tampilkan modal ubah
		  openUbahModal();
		}

    function openUbahModal() {
      document.getElementById("ubahModal").classList.replace("hidden", "flex");
    }

    function closeUbahModal() {
      document.getElementById("ubahModal").classList.replace("flex", "hidden");
    }
	
	// === Pengaturan Tombol KIRIM Berdasarkan Waktu ===
	function updateWaktuKirim() {
	  const btnKirim = document.getElementById("submit");
	  const now = new Date();
	  const jam = now.getHours();
	  const menit = now.getMinutes();
	  const totalMenit = jam * 60 + menit;

	  // Rentang nonaktif: 07:20 sampai 02:00 (keesokan harinya)
	  const batasNonaktifMulai = 7 * 60 + 20;  // 07:20
	  const batasNonaktifSelesai = 2 * 60;     // 02:00

	  let nonaktif = false;

	  if (batasNonaktifMulai < 1440 && batasNonaktifSelesai < batasNonaktifMulai) {
		// Rentang melewati tengah malam, contoh: 07:20 -> 02:00
		nonaktif = totalMenit >= batasNonaktifMulai || totalMenit < batasNonaktifSelesai;
	  } else {
		// Rentang normal (tidak lintas hari)
		nonaktif = totalMenit >= batasNonaktifMulai && totalMenit < batasNonaktifSelesai;
	  }

	  if (nonaktif) {
		// === Dalam rentang waktu nonaktif ===
		btnKirim.disabled = true;
		btnKirim.classList.add("opacity-50", "cursor-not-allowed", "bg-gray-400");
		btnKirim.classList.remove("bg-blue-600", "hover:bg-blue-700");
		btnKirim.textContent = "Kirim";
	  } else {
		// === Di luar waktu nonaktif (aktif kembali) ===
		btnKirim.disabled = false;
		btnKirim.classList.remove("opacity-50", "cursor-not-allowed", "bg-gray-400");
		btnKirim.classList.add("bg-blue-600", "hover:bg-blue-700");
		btnKirim.textContent = "Kirim";
	  }
	}

	// Jalankan tiap 30 detik agar selalu update
	setInterval(updateWaktuKirim, 30000);
	updateWaktuKirim();

    function openDetailModal(nama, nis, mapel, jam, tanggal, alasan, kirimbukti, status) {
      document.getElementById("namaDetail").value = nama;
	  document.getElementById("nisDetail").value = nis;
	  document.getElementById("mapelDetail").value = mapel;
	  document.getElementById("jamDetail").value = jam;
	  document.getElementById("tanggalDetail").value = tanggal;
	  document.getElementById("alasanDetail").value = alasan;
	  document.getElementById("kirimbuktiDetail").value = kirimbukti;
      document.getElementById("statusDetail").value = status;
      document.getElementById("detailModal").classList.replace("hidden", "flex");
    }

    function closeDetailModal() {
      document.getElementById("detailModal").classList.replace("flex", "hidden");
    }

    function submitUbah(e) {
      e.preventDefault();
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Keterangan siswa berhasil dikirim.",
        confirmButtonColor: "#7C3AED"
      });
      closeUbahModal();
    }

    // === Sidebar Burger ===
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    const burgerButton = document.getElementById("burgerButton");

    burgerButton.addEventListener("click", () => {
      const isOpen = sidebar.classList.contains("translate-x-0");
      if (isOpen) {
        sidebar.classList.replace("translate-x-0", "-translate-x-full");
        backdrop.classList.add("hidden");
      } else {
        sidebar.classList.replace("-translate-x-full", "translate-x-0");
        backdrop.classList.remove("hidden");
      }
    });

    backdrop.addEventListener("click", () => {
      sidebar.classList.replace("translate-x-0", "-translate-x-full");
      backdrop.classList.add("hidden");
    });