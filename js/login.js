// Elemen Tampilan Menu & Form
const roleSelection = document.getElementById("roleSelection");
const loginFormContainer = document.getElementById("loginFormContainer");
const btnPilihSiswa = document.getElementById("btnPilihSiswa");
const btnPilihGuru = document.getElementById("btnPilihGuru");
const btnKembali = document.getElementById("btnKembali");

// Elemen Field Form
const identifierLabel = document.getElementById("identifierLabel");
const identifierInput = document.getElementById("identifierInput");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginForm = document.getElementById("loginForm");
const btnLoginSubmit = document.getElementById("btnLoginSubmit");

let currentRole = "siswa";

// Beralih ke Form Login Siswa
if (btnPilihSiswa) {
  btnPilihSiswa.addEventListener("click", () => {
    currentRole = "siswa";
    identifierLabel.innerText = "NIS/Nomor Induk Siswa";
    identifierInput.placeholder = "Masukkan NIS Anda";
    btnLoginSubmit.className = "w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition shadow";

    roleSelection.classList.add("hidden");
    loginFormContainer.classList.remove("hidden");
    identifierInput.focus();
  });
}

// Beralih ke Form Login Guru
if (btnPilihGuru) {
  btnPilihGuru.addEventListener("click", () => {
    currentRole = "guru";
    identifierLabel.innerText = "NIP";
    identifierInput.placeholder = "Masukkan NIP Anda";
    btnLoginSubmit.className = "w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition shadow";

    roleSelection.classList.add("hidden");
    loginFormContainer.classList.remove("hidden");
    identifierInput.focus();
  });
}

// Tombol Kembali ke Pemilihan Peran
if (btnKembali) {
  btnKembali.addEventListener("click", () => {
    loginFormContainer.classList.add("hidden");
    roleSelection.classList.remove("hidden");
    loginForm.reset();
  });
}

// Toggle Visibilitas Password
if (togglePassword && passwordInput) {
  const icon = togglePassword.querySelector(".material-icons");

  togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    if (icon) {
      icon.textContent = isHidden ? "visibility" : "visibility_off";
    }
  });
}

// Validasi Form Login
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    const idVal = identifierInput.value.trim();
    const passVal = passwordInput.value.trim();

    if (!idVal || !passVal) {
      e.preventDefault();
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: `Silakan masukkan ${currentRole === "siswa" ? "NIS" : "NIP"} dan password!`,
        confirmButtonColor: currentRole === "siswa" ? "#2563eb" : "#16a34a",
      });
    }
  });
}