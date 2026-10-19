document.addEventListener('DOMContentLoaded', function () {
      const btn = document.getElementById('bioToggle');
      const submenu = document.getElementById('submenuBio');
      const chevron = document.getElementById('bioChevron');
      const burgerBtn = document.getElementById('burgerBtn');
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('overlay');

      // Submenu toggle
      btn.addEventListener('click', function () {
        submenu.classList.toggle('hidden');
        const isOpen = !submenu.classList.contains('hidden');
        chevron.classList.toggle('rotate-180', isOpen);
      });

      // Burger sidebar toggle
      burgerBtn.addEventListener('click', function () {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
      });

      // Klik overlay untuk menutup sidebar
      overlay.addEventListener('click', function () {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
      });
    });