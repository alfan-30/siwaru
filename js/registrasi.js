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
	  
	  // === Validasi Email ===
	  const emailInput = document.getElementById("email");
	  const emailError = document.getElementById("emailError");

	  emailInput.addEventListener("input", function () {
		const emailValue = this.value.trim();

		// Validasi harus mengandung @ dan gmail.com
		const valid = emailValue.includes("@") && emailValue.endsWith("gmail.com");

		if (!valid && emailValue !== "") {
		  emailError.classList.remove("hidden");
		} else {
		  emailError.classList.add("hidden");
		}
	  });
	  
	  // Fungsi untuk menampilkan atau menyembunyikan password
	  function togglePassword(id, button) {
		const input = document.getElementById(id);
		const icon = button.querySelector(".material-icons");

		// Jika password sedang disembunyikan
		if (input.type === "password") {
		  input.type = "text"; 
		  icon.textContent = "visibility"; // mata terbuka (password terlihat)
		} else {
		  input.type = "password";
		  icon.textContent = "visibility_off"; // mata tertutup (password disembunyikan)
		}
	  }
  
    // validasi nip dan jabatan
    const nipInput = document.getElementById("nip_nis");
	const nipError = document.getElementById("nipError");
	const jabatanSelect = document.getElementById("jabatan");
	const kelasSelect = document.getElementById("kelas");

	  nipInput.addEventListener("input", function () {
		// Validasi hanya angka
		if (/[^0-9]/.test(this.value)) {
		  this.value = this.value.replace(/[^0-9]/g, "");
		  nipError.classList.remove("hidden");
		} else {
		  nipError.classList.add("hidden");
		}

		// Ambil dua angka awal
		const awal = this.value.substring(0, 2);

		// Reset opsi jabatan agar aktif kembali
		for (let i = 0; i < jabatanSelect.options.length; i++) {
		  jabatanSelect.options[i].disabled = false;
		}

		// === Logika untuk Jabatan ===
		if (awal === "12") {
		  jabatanSelect.value = "guru";
		  jabatanSelect.querySelector("option[value='siswa']").disabled = true;
		} else if (awal === "14") {
		  jabatanSelect.value = "siswa";
		  jabatanSelect.querySelector("option[value='guru']").disabled = true;
		} else {
		  jabatanSelect.value = "Pilih jabatan";
		}

		// === Logika untuk Dropdown Kelas ===
		if (awal === "14") {
		  kelasSelect.disabled = false;
		  kelasSelect.innerHTML = `
			<option value="">-- Pilih Kelas --</option>
			<option value="10 TKJ 1">10 TKJ 1</option>
			<option value="10 MM 1">10 MM 1</option>
			<option value="10 TITL 1">10 TITL 1</option>
			<option value="10 TPM 1">10 TPM 1</option>
		  `;
		  kelasSelect.classList.remove("bg-gray-200", "text-gray-500");
		} else if (awal === "12") {
		  kelasSelect.disabled = true;
		  kelasSelect.innerHTML = `<option value="">-- Pilih Kelas --</option>`;
		  kelasSelect.classList.add("bg-gray-200", "text-gray-500");
		} else {
		  kelasSelect.disabled = true;
		  kelasSelect.innerHTML = `<option value="">-- Pilih Kelas --</option>`;
		  kelasSelect.classList.add("bg-gray-200", "text-gray-500");
		}
	  });

    // Password Validation
    function validatePassword() {
      const pass = document.getElementById("password").value;
      const confirm = document.getElementById("konfirmasi_password").value;

      const strengthBar = document.getElementById("passwordStrength");
      const confirmBar = document.getElementById("confirmStrength");

      const valid = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/;

      // Update password bar
      if (valid.test(pass)) {
        strengthBar.style.width = "100%";
        strengthBar.style.backgroundColor = "green";
      } else {
        strengthBar.style.width = "75%";
        strengthBar.style.backgroundColor = "red";
      }

      // Update confirm bar
      if (confirm === pass && valid.test(pass)) {
        confirmBar.style.width = "100%";
        confirmBar.style.backgroundColor = "green";
      } else {
        confirmBar.style.width = "75%";
        confirmBar.style.backgroundColor = "red";
      }
    }

    document.getElementById("password").addEventListener("input", validatePassword);
    document.getElementById("konfirmasi_password").addEventListener("input", validatePassword);

    