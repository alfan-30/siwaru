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
		
		// Dropdown Bio Data
		document.addEventListener('DOMContentLoaded', function () {
		  const btn = document.getElementById('bioToggle');
		  const submenu = document.getElementById('submenuBio');
		  const chevron = document.getElementById('bioChevron');

		  btn.addEventListener('click', function () {
			submenu.classList.toggle('hidden');
			const isOpen = !submenu.classList.contains('hidden');
			chevron.classList.toggle('rotate-180', isOpen);
		  });
		});

		// Buka Detail
		function openDetail(nama, mapel, guru, tanggal, status) {
		  document.getElementById("detailNama").value = nama;
		  document.getElementById("detailMapel").value = mapel;
		  document.getElementById("detailGuru").value = guru;
		  document.getElementById("detailTanggal").value = tanggal;
		  document.getElementById("detailStatus").value = status;
		  document.getElementById("detailModal").classList.remove("hidden");
		}

		// Tutup Detail
		function closeDetail() {
		  document.getElementById("detailModal").classList.add("hidden");
		}

		// Simpan data baris yang dipilih
		let selectedRowData = null;
		document.querySelectorAll("tbody tr").forEach(row => {
		  row.addEventListener("click", () => {
			const cells = row.querySelectorAll("td");
			selectedRowData = {
			  nama: cells[1].innerText,
			  mapel: cells[2].innerText,
			  guru: cells[3].innerText,
			  tanggal: cells[4].innerText,
			  status: cells[5].innerText,
			};
			document.querySelectorAll("tbody tr").forEach(r => r.classList.remove("bg-gray-200"));
			row.classList.add("bg-gray-200");
		  });
		});

	  // Cetak semua data pada tabel
	  function printData() {
		Swal.fire({
		  title: "Apakah Anda yakin?",
		  text: "Semua data pada tabel akan dicetak!",
		  icon: "question",
		  showCancelButton: true,
		  confirmButtonColor: "#16a34a",
		  cancelButtonColor: "#d33",
		  confirmButtonText: "Ya, cetak!"
		}).then((result) => {
		  if (result.isConfirmed) {
		  // Clone tabel biar aslinya tidak terhapus
		  var tableClone = document.querySelector("table").cloneNode(true);

		  // Hapus kolom ke-7 (Detail)
		  tableClone.querySelectorAll("tr").forEach(row => {
			if (row.cells.length >= 7) {
			  row.deleteCell(6); // index ke-6 = kolom ke-7
			}
		  });

		  // Cetak hasil clone
		  var newWin = window.open("");
		  newWin.document.write(`
			<html>
			  <head>
				<title>Cetak Semua Data</title>
				<style>
				  body { font-family: Arial, sans-serif; margin: 20px; }
				  h2 { text-align: center; margin-bottom: 20px; }
				  table { border-collapse: collapse; width: 100%; }
				  th, td { border: 1px solid #000; padding: 8px; text-align: left; }
				  th { background: #f2f2f2; }
				</style>
			  </head>
			  <body>
				<h2>Data Riwayat Jadwal</h2>
				${tableClone.outerHTML}
			  </body>
			</html>
		  `);
		  newWin.document.close();
		  newWin.print();
		}
	  });
	}