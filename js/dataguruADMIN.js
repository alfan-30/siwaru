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
    function openDetail(nama, nip, notlp, alamat, kelamin, status) {
      document.getElementById("detailNama").value = nama;
      document.getElementById("detailNip").value = nip;
	  document.getElementById("detailNotlp").value = notlp;
      document.getElementById("detailAlamat").value = alamat;
	  document.getElementById("detailKelamin").value = kelamin;
	  document.getElementById("detailStatus").value = status;
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
          nama: cells[1].innerText,
          nip: cells[2].innerText,
		  notlp: cells[3].innerText,
          alamat: cells[4].innerText,
		  kelamin: cells[5].innerText,
		  status: cells[6].innerText,
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

    // === Tambah Data Guru ===
  function openTambahForm() {
    const modal = document.getElementById("modalTambah");
    modal.classList.remove("hidden");

    // Reset semua input agar tidak membawa data lama
    const form = modal.querySelector("form");
    form.reset();

    // Tangani submit form tambah data
    form.onsubmit = (e) => {
      e.preventDefault();

      Swal.fire("Berhasil!", "Data berhasil ditambahkan.", "success");
      modal.classList.add("hidden");
    };
  }

	  // === Tutup Modal ===
	  function closeModal(id) {
		document.getElementById(id).classList.add("hidden");
	  }

	  // === Update Modal Data Guru ===
	  function openUpdateForm() {
		if (!selectedRowData) {
		  Swal.fire("Peringatan", "Silakan pilih baris data dulu!", "warning");
		  return;
		}

		const modal = document.getElementById("modalEdit");
		modal.classList.remove("hidden");

		// Isi form edit dengan data dari baris terpilih
		const inputs = modal.querySelectorAll("input, select");
		inputs[0].value = selectedRowData.nama;
		inputs[1].value = selectedRowData.nip;
		inputs[2].value = selectedRowData.notlp;
		inputs[3].value = selectedRowData.alamat;
		inputs[4].value = selectedRowData.kelamin; // pastikan value di <option> sama
		inputs[5].value = selectedRowData.status;

		// Tangani submit form edit
		const form = modal.querySelector("form");
		form.onsubmit = (e) => {
		  e.preventDefault();

		  Swal.fire({
			title: "Apakah Anda yakin?",
			text: "Data akan diperbarui sesuai tabel!",
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