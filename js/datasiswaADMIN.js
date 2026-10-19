// Toggle sidebar di HP
document.querySelectorAll("[data-toggle=sidebar]").forEach(btn => {
  btn.addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full");
    }
  });
});

// Klik luar sidebar untuk menutup (HP saja)
document.addEventListener("click", (e) => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = e.target.closest("[data-toggle=sidebar]");
  if (sidebar && !sidebar.contains(e.target) && !toggleBtn && window.innerWidth < 768) {
    sidebar.classList.add("-translate-x-full");
  }
});

// Fungsi search filter
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", function () {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll("table tbody tr");

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(filter) ? "" : "none";
    });
  });
}

// Dropdown Bio Data
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("bioToggle");
  const submenu = document.getElementById("submenuBio");
  const chevron = document.getElementById("bioChevron");

  if (btn && submenu) {
    btn.addEventListener("click", function () {
      submenu.classList.toggle("hidden");
      const isOpen = !submenu.classList.contains("hidden");
      if (chevron) {
        chevron.classList.toggle("rotate-180", isOpen);
      }
    });
  }
});

// Buka Modal Tambah Data Siswa
function openAbsensiForm() {
  const modal = document.getElementById("absensiModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  
  const title = modal.querySelector("h3");
  if (title) title.innerText = "Form Tambah Data Siswa";

  const form = modal.querySelector("form");
  if (form) {
    form.reset();
    form.onsubmit = function (e) {
      e.preventDefault();
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data siswa berhasil ditambahkan!",
        confirmButtonColor: "#16a34a"
      }).then(() => {
        closeAbsensiForm();
      });
    };
  }
}

// Tutup Modal Tambah Data Siswa
function closeAbsensiForm() {
  const modal = document.getElementById("absensiModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// Buka Modal Detail
function openDetail(nama, nis, notlp, alamat, kelamin, status) {
  const detailNama = document.getElementById("detailNama");
  const detailNip = document.getElementById("detailNip");
  const detailNotlp = document.getElementById("detailNotlp");
  const detailAlamat = document.getElementById("detailAlamat");
  const detailKelamin = document.getElementById("detailKelamin");
  const detailStatus = document.getElementById("detailStatus");

  if (detailNama) detailNama.value = nama;
  if (detailNip) detailNip.value = nis;
  if (detailNotlp) detailNotlp.value = notlp;
  if (detailAlamat) detailAlamat.value = alamat;
  if (detailKelamin) detailKelamin.value = kelamin;
  if (detailStatus) detailStatus.value = status;

  const modal = document.getElementById("detailModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

// Tutup Modal Detail
function closeDetail() {
  const modal = document.getElementById("detailModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// Seleksi Baris Tabel
let selectedRowData = null;
document.querySelectorAll("tbody tr").forEach(row => {
  row.addEventListener("click", () => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 7) return;

    selectedRowData = {
      nama: cells[1].innerText.trim(),
      nis: cells[2].innerText.trim(),
      notlp: cells[3].innerText.trim(),
      alamat: cells[4].innerText.trim(),
      kelamin: cells[5].innerText.trim(),
      status: cells[6].innerText.trim()
    };

    document.querySelectorAll("tbody tr").forEach(r => r.classList.remove("bg-gray-200"));
    row.classList.add("bg-gray-200");
  });
});

// Hapus Data
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
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal"
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
      selectedRowData = null;
      document.querySelectorAll("tbody tr").forEach(r => r.classList.remove("bg-gray-200"));
    }
  });
}

// Tutup Modal Umum
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// Buka dan Isi Form Update Data Siswa
function openUpdateForm() {
  if (!selectedRowData) {
    Swal.fire("Peringatan", "Silakan pilih baris data dulu!", "warning");
    return;
  }

  const modal = document.getElementById("modalEdit");
  if (!modal) return;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Isi input berdasarkan urutan persis seperti di Data Guru
  const inputs = modal.querySelectorAll("input, select");
  if (inputs.length >= 6) {
    inputs[0].value = selectedRowData.nama;
    inputs[1].value = selectedRowData.nis;
    inputs[2].value = selectedRowData.notlp;
    inputs[3].value = selectedRowData.alamat;
    inputs[4].value = selectedRowData.kelamin;
    inputs[5].value = selectedRowData.status;
  }

  // Tangani submit form edit
  const form = modal.querySelector("form");
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();

      Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Data akan diperbarui sesuai tabel!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#16a34a",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, update!",
        cancelButtonText: "Batal"
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire("Berhasil!", "Data berhasil diperbarui.", "success");
          closeModal("modalEdit");
        }
      });
    };
  }
}