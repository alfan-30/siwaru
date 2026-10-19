// Toggle password visibility
    const passwordInput = document.getElementById("password");
	const togglePassword = document.getElementById("togglePassword");
	const icon = togglePassword.querySelector(".material-icons");

	  togglePassword.addEventListener("click", () => {
		const isHidden = passwordInput.type === "password";
		passwordInput.type = isHidden ? "text" : "password";
		icon.textContent = isHidden ? "visibility" : "visibility_off";
	  });


// Reset password ditangani oleh src/main.jsx melalui Supabase Auth.
