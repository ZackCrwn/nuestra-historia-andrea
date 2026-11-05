(() => {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) { event.preventDefault(); target.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); }
  }));
  // El botón queda preparado para añadir música propia cuando Isaac elija una pista.
  const sound = document.getElementById('soundToggle');
  sound.addEventListener('click', () => {
    sound.classList.toggle('is-selected');
    sound.setAttribute('aria-label', 'La música se añadirá cuando elijamos una canción especial');
    sound.title = 'Podremos añadir una canción especial más adelante';
  });
})();