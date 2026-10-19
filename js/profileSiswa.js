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