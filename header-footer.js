(function () {
  var navToggle = document.querySelector('.c-nav-toggle');
  var nav = document.querySelector('.c-nav');
  var yearEl = document.querySelector('[data-js="year"]');

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  if (!navToggle || !nav) return;

  navToggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('c-nav--open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
})();