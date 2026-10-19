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
	
	// Modal tambah
    function openAbsensiForm() {
    // Tampilkan modal tambah data
    document.getElementById('modalTambah').classList.remove('hidden');
    document.querySelector("#modalTambah h3").innerText = "Form Tambah Data Mahasiswa";

    // Tangani event submit form tambah
    const form = document.querySelector("#modalTambah form");
    form.onsubmit = (e) => {
      e.preventDefault();

      // Ambil semua input dan textarea di dalam form
      const inputs = form.querySelectorAll("input, textarea, select");
      let isEmpty = false;

      // Cek apakah ada yang kosong
      inputs.forEach(input => {
        if (!input.value.trim()) {
          isEmpty = true;
        }
      });

      // Jika ada yang kosong → tampilkan SweetAlert warning
      if (isEmpty) {
        Swal.fire({
          icon: "warning",
          title: "Ups!",
          text: "Data tidak boleh kosong!",
          confirmButtonColor: "#d33",
        });
        return;
      }

      // Jika semua terisi → tampilkan SweetAlert sukses
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data berhasil ditambahkan!",
        confirmButtonColor: "#16a34a",
      }).then(() => {
        // Tutup modal setelah klik OK
        closeAbsensiForm();

        // Reset form
        form.reset();
      });
    };
  }

  function closeAbsensiForm() {
    document.getElementById('modalTambah').classList.add('hidden');
  }

    // Buka Detail
    function openDetail(nim, nama, notlp, email, alamat, jk) {
      document.getElementById("detailNim").value = nim;
      document.getElementById("detailNama").value = nama;
      document.getElementById("detailNotlp").value = notlp;
	  document.getElementById("detailEmail").value = email;
      document.getElementById("detailAlamat").value = alamat;
	  document.getElementById("detailJk").value = jk;
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
          nim: cells[1].innerText,
          nama: cells[2].innerText,
          notlp: cells[3].innerText,
		  email: cells[4].innerText,
          alamat: cells[5].innerText,
		  jk: cells[6].innerText,
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

    // === Tambah Data Siswa ===
  function openTambahForm() {
    const modal = document.getElementById("modalTambah");
    modal.classList.remove("hidden");

    // Reset semua input agar tidak membawa data lama
    modal.querySelector("form").reset();

    // Tangani submit form tambah data
    modal.querySelector("form").onsubmit = (e) => {
      e.preventDefault();

      Swal.fire("Berhasil!", "Data berhasil ditambahkan.", "success");
      modal.classList.add("hidden");
    };
  }

  // === Fungsi menutup modal ===
  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("hidden");
  }

  // === Fungsi membuka dan mengisi modal update ===
  function openUpdateForm() {
    if (!selectedRowData) {
      Swal.fire("Peringatan", "Silakan pilih baris data dulu!", "warning");
      return;
    }

    const modal = document.getElementById("modalUpdate");
    modal.classList.remove("hidden");

    // Isi field berdasarkan ID
    document.getElementById("updateNim").value = selectedRowData.nim || "";
    document.getElementById("updateNama").value = selectedRowData.nama || "";
    document.getElementById("updateNotlp").value = selectedRowData.notlp || "";
    document.getElementById("updateEmail").value = selectedRowData.email || "";
    document.getElementById("updateAlamat").value = selectedRowData.alamat || "";
    document.getElementById("updateJK").value = selectedRowData.jk || "";

    // Tangani submit form edit
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