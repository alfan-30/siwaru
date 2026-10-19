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

    function openAbsensiForm() {
      document.getElementById('absensiModal').classList.remove('hidden');
      document.querySelector("#absensiModal h3").innerText = "Form Tambah Jadwal";
    }
    function closeAbsensiForm() {
      document.getElementById('absensiModal').classList.add('hidden');
    }

	// Buka Detail
    function openDetail(kode, mapel, guru, tanggal, jam, ruang, kelas) {
      document.getElementById("detailKode").value = kode;
      document.getElementById("detailMapel").value = mapel;
	  document.getElementById("detailGuru").value = guru;
      document.getElementById("detailTanggal").value = tanggal;
      document.getElementById("detailJam").value = jam;
      document.getElementById("detailRuang").value = ruang;
      document.getElementById("detailKelas").value = kelas;

      document.getElementById("detailModal").classList.remove("hidden");
    }

    // Tutup Detail
    function closeDetail() {
      document.getElementById("detailModal").classList.add("hidden");
    }

    // Data terpilih
    let selectedRowData = null;
    document.querySelectorAll("tbody tr").forEach(row => {
      row.addEventListener("click", () => {
        const cells = row.querySelectorAll("td");
        selectedRowData = {
          kode: cells[1].innerText,
          mapel: cells[2].innerText,
		  guru: cells[3].innerText,
          tanggal: cells[4].innerText,
          jam: cells[5].innerText,
          ruang: cells[6].innerText,
          kelas: cells[7].innerText,
        };
        document.querySelectorAll("tbody tr").forEach(r => r.classList.remove("bg-gray-200"));
        row.classList.add("bg-gray-200");
      });
    });

    // Hapus data
    function confirmDelete() {
      if (!selectedRowData) {
        Swal.fire("Peringatan", "Silakan pilih baris data dulu!", "warning");
        return;
      }
      Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Data ini akan dihapus permanen!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!"
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
        }
      });
    }
	
	//untuk menutup modals update
	function closeModal(id) {
	  const modal = document.getElementById(id);
	  if (modal) {
		modal.classList.add("hidden");
	  }
	}

    // Tambah data
	function openTambahForm() {
	  const modal = document.getElementById("modalTambah");
	  modal.classList.remove("hidden");

	  // Reset form agar tidak ada data lama
	  modal.querySelector("form").reset();

	  modal.querySelector("form").onsubmit = (e) => {
		e.preventDefault();
		Swal.fire("Berhasil!", "Data berhasil ditambahkan.", "success");
		modal.classList.add("hidden");
	  };
	}

	// Update data
	function openUpdateForm() {
	  if (!selectedRowData) {
		Swal.fire("Peringatan", "Silakan pilih baris data dulu!", "warning");
		return;
	  }

	  const modal = document.getElementById("modalEdit");
	  modal.classList.remove("hidden");

	  // Isi form edit dengan data terpilih
	  const inputs = modal.querySelectorAll("input, select");
	  inputs[0].value = selectedRowData.kode;
	  inputs[1].value = selectedRowData.mapel;
	  inputs[2].value = selectedRowData.guru;
	  inputs[3].value = selectedRowData.tanggal;
	  inputs[4].value = selectedRowData.jam;
	  inputs[5].value = selectedRowData.ruang;
	  inputs[6].value = selectedRowData.kelas;

	  modal.querySelector("form").onsubmit = (e) => {
		e.preventDefault();
		Swal.fire({
		  title: "Apakah Anda yakin?",
		  text: "Data akan diperbarui!",
		  icon: "warning",
		  showCancelButton: true,
		  confirmButtonColor: "#16a34a",
		  cancelButtonColor: "#d33",
		  confirmButtonText: "Ya, update!"
		}).then((result) => {
		  if (result.isConfirmed) {
			Swal.fire("Berhasil!", "Data berhasil diperbarui.", "success");
			modal.classList.add("hidden");
		  }
		});
	  };
	}