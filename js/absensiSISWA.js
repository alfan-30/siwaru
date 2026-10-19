// === Sidebar Toggle (Mobile) ===
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

	  // === Fungsi Search Filter ===
	  document.getElementById("searchInput").addEventListener("input", function () {
		const filter = this.value.toLowerCase();
		const rows = document.querySelectorAll("table tbody tr");

		rows.forEach(row => {
		  const text = row.innerText.toLowerCase();
		  row.style.display = text.includes(filter) ? "" : "none";
		});
	  });

	  // === Fungsi Modal Detail ===
	  function openDetail(nama, nis, mapel, tanggal, jam, status) {
		document.getElementById('detailNama').value = nama;
		document.getElementById('detailNis').value = nis;
		document.getElementById('detailMapel').value = mapel;
		document.getElementById('detailTanggal').value = tanggal;
		document.getElementById('detailWaktu').value = jam;
		document.getElementById('detailStatus').value = status;
		document.getElementById('detailModal').classList.remove('hidden'); document.getElementById('detailModal').classList.add('flex');
	  }

	  function closeDetail() {
		document.getElementById('detailModal').classList.remove('flex'); document.getElementById('detailModal').classList.add('hidden');
	  }

	  // === Modal Absensi ===
	  function openAbsensiForm() {
		document.getElementById("absensiModal").classList.remove("hidden"); document.getElementById("absensiModal").classList.add("flex");
		updateWaktuAbsensi();
	  }

	  function closeAbsensiForm() {
		document.getElementById("absensiModal").classList.remove("flex"); document.getElementById("absensiModal").classList.add("hidden");
	  }

	  // === Pengaturan Tombol SIMPAN Berdasarkan Waktu ===
	  // Absensi dibuka 07:00 - 07:30 WIB, mulai 07:31 ditutup (aturan di js/absensi-config.js).
	  function updateWaktuAbsensi() {
		const btnSimpan = document.getElementById("btnSimpan");
		const waktuDisplay = document.getElementById("waktuDisplay");
		const jadwal = window.SIWARU_ABSENSI;
		const status = jadwal.status();

		// Jam tampil di header (WIB)
		waktuDisplay.textContent = jadwal.clockText();

		// Keterangan di dalam form absensi
		let info = document.getElementById("absensiInfo");
		if (!info) {
		  info = document.createElement("p");
		  info.id = "absensiInfo";
		  info.className = "text-sm font-medium";
		  btnSimpan.closest("div").parentNode.insertBefore(info, btnSimpan.closest("div"));
		}

		if (status === "buka") {
		  btnSimpan.disabled = false;
		  btnSimpan.classList.remove("opacity-50", "cursor-not-allowed");
		  waktuDisplay.style.color = "green";
		  info.style.color = "green";
		  info.textContent = "Absensi dibuka sampai pukul " + jadwal.jamTutup + " WIB.";
		} else {
		  btnSimpan.disabled = true;
		  btnSimpan.classList.add("opacity-50", "cursor-not-allowed");
		  waktuDisplay.style.color = status === "tutup" ? "red" : "gray";
		  info.style.color = status === "tutup" ? "red" : "gray";
		  info.textContent = status === "tutup"
			? "Absensi ditutup. Absensi dibuka pukul " + jadwal.jamBuka + " - " + jadwal.jamTutup + " WIB."
			: "Absensi belum dibuka. Absensi dibuka pukul " + jadwal.jamBuka + " - " + jadwal.jamTutup + " WIB.";
		}
	  }

	  // Update setiap 1 detik (waktu realtime & status tombol)
	  setInterval(updateWaktuAbsensi, 1000);

	  // Jalankan saat halaman pertama kali dibuka
	  window.addEventListener("load", updateWaktuAbsensi);

	  // === Waktu real-time di header (hanya saat halaman dibuka) ===
		window.addEventListener("load", () => {
		  const waktuDisplay = document.getElementById("waktuDisplay");
		  if (waktuDisplay) {
			function updateWaktuRealtime() {
			  const now = new Date();
			  const formattedTime = now.toLocaleTimeString("id-ID", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false
			  });
			  waktuDisplay.textContent = formattedTime;
			}

			updateWaktuRealtime(); // tampilkan waktu saat halaman dibuka
			setInterval(updateWaktuRealtime, 1000); // update tiap 1 detik
		  }
		});
		
		
		
		// Email peringatan hanya terkirim bila halaman ini sedang terbuka di browser (bukan penjadwal server),
		// sehingga setiap siswa yang membukanya akan memicu kiriman ke semua penerima. Aktifkan hanya bila memang diperlukan.
		const AKTIFKAN_EMAIL_PERINGATAN = false;

		// === Fungsi kirim email peringatan ===
		function kirimEmailPeringatan(jenis) {
		  // Daftar penerima email
		  const penerima = [
			"radhitafanbahurdin@gmail.com",
			"vikofrendy20@gmail.com",
			"yogadf7@gmail.com",
			"calvinarbiansyah4@gmail.com",
			"soelastri830@gmail.com"
		  ];

		 // Kirim ke setiap penerima
		  penerima.forEach(email => {
			emailjs.send("service_absensi", "template_absensi", {
			  to_email: email,
			  name: "SIWARU",
			  time: jenis === "pagi_buka"
				? "07.00"
				: jenis === "pagi_segera"
				? "07.00"
				: "07.30",
			  subject:
				jenis === "pagi_segera"
				  ? "Peringatan: Absensi Akan Segera Dibuka"
				  : jenis === "pagi_buka"
				  ? "Peringatan: Absensi Pagi Sudah Dibuka"
				  : "Peringatan: Absen Pulang Sudah Dibuka",
			  message:
				jenis === "pagi_segera"
				  ? "⏰ Absensi akan segera dibuka pada pukul 07.00. Mohon bersiap untuk melakukan absensi dengan tepat waktu!"
				  : jenis === "pagi_buka"
				  ? "🔔 Absensi telah dibuka! Silakan absen sebelum pukul 07.30."
				  : "🔔 Pengingat: absensi ditutup pukul 07.30. Segera lakukan absensi."
			})
			.then(() => console.log("✅ Email terkirim ke:", email))
			.catch(err => console.error("❌ Gagal kirim ke:", email, err));
		  });
		}

		// === Fungsi pengecekan waktu otomatis ===
		function cekWaktuDanKirim() {
		  const now = new Date();
		  if (!AKTIFKAN_EMAIL_PERINGATAN) return;
		  const jam = now.getHours();
		  const menit = now.getMinutes();

		  // Peringatan absensi akan dibuka
		  if (jam === 6 && menit === 55) {
			kirimEmailPeringatan("pagi_segera");
		  }

		  // Peringatan absensi sudah dibuka
		  if (jam === 7 && menit === 0) {
			kirimEmailPeringatan("pagi_buka");
		  }

		  
		  // Peringatan absen siang
			if (jam === 7 && menit === 25) {
			  kirimEmailPeringatan("siang_tutup");
		  }
		}

		// Jalankan pengecekan tiap 1 menit
		setInterval(cekWaktuDanKirim, 60000);