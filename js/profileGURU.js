	//validasi no.tlp
	const tlpInput = document.getElementById("no_tlp");
	const tlpError = document.getElementById("tlpError");

  tlpInput.addEventListener("input", function(e) {
    const rawValue = e.target.value; // nilai mentah sebelum dibersihkan
    
    // Jika user ketik huruf → tampilkan pesan
    if (/[^0-9]/.test(rawValue)) {
      tlpError.classList.remove("hidden");
    } else {
      tlpError.classList.add("hidden");
    }

    // Bersihkan jadi angka
    this.value = rawValue.replace(/[^0-9]/g, "");

    // Batasi 12 digit
    if (this.value.length > 12) {
      this.value = this.value.slice(0, 12);
      tlpError.classList.remove("hidden");
    }
  });
  
	//validasi nama
	const namaInput = document.getElementById("nama");
	const namaError = document.getElementById("namaError");

  namaInput.addEventListener("input", function() {
    // Jika ada karakter selain huruf atau spasi
    if (/[^a-zA-Z\s]/.test(this.value)) {
      this.value = this.value.replace(/[^a-zA-Z\s]/g, ""); 
      namaError.classList.remove("hidden"); // tampilkan error
    } else {
      namaError.classList.add("hidden"); // sembunyikan error
    }
  });
  
	//validasi nip dan nis
	const nipInput = document.getElementById("nip_nis");
	const nipError = document.getElementById("nipError");

  nipInput.addEventListener("input", function() {
    // jika user mengetik huruf, hapus & tampilkan error
    if (/[^0-9]/.test(this.value)) {
      this.value = this.value.replace(/[^0-9]/g, ""); 
      nipError.classList.remove("hidden");
    } else {
      nipError.classList.add("hidden");
    }
  });
  
	//tombol ganti foto profile
	const uploadInput = document.getElementById("uploadProfile");
	const profileImage = document.getElementById("profileImage");

  // Saat user memilih gambar
  uploadInput.addEventListener("change", function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        profileImage.src = e.target.result; // tampilkan gambar baru
      };
      reader.readAsDataURL(file);
    }
  });
  
    // SweetAlert
    document.addEventListener('DOMContentLoaded', function () {
      const form = document.getElementById('editProfileForm');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const inputs = form.querySelectorAll('input, select');
        let allFilled = true;
        inputs.forEach(input => {
          if (input.value.trim() === '') allFilled = false;
        });
        if (!allFilled) {
          Swal.fire({ icon: 'warning', title: 'Mohon isi semua data!' });
          return;
        }
        Swal.fire({
          title: 'Apakah Anda yakin ingin merubah data ini?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Ya',
          cancelButtonText: 'Tidak'
        }).then((result) => {
          if (result.isConfirmed) form.submit();
        });
      });

      // Sidebar toggle (mobile)
      const burgerBtn = document.getElementById('burgerBtn');
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('overlay');
      burgerBtn.addEventListener('click', function () {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
      });
      overlay.addEventListener('click', function () {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
      });
    });