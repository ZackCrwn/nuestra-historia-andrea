(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('main > section')];
  const names = [
    'PORTADA','PRÓLOGO','CAPÍTULO I','CAPÍTULO II','CAPÍTULO III · EL NIDITO',
    'NUESTRA FAMILIA','CAPÍTULO IV · RECUERDOS','CAPÍTULO V · DÍAS DIFÍCILES',
    'ANTONIO','CAPÍTULO VII · SUEÑOS','INTERLUDIO','CARTA FINAL'
  ];
  const label = document.getElementById('pageLabel');
  const prev = document.getElementById('previousPage');
  const next = document.getElementById('nextPage');
  const progress = document.getElementById('readingProgress');
  let active = 0;
  let scrolling = false;

  function updateControls(index) {
    active = Math.max(0, Math.min(sections.length - 1, index));
    if (label) label.textContent = names[active] || 'NUESTRA HISTORIA';
    if (prev) prev.disabled = active === 0;
    if (next) next.disabled = active === sections.length - 1;
  }

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const amount = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    if (progress) progress.style.width = amount + '%';
  }

  function go(index) {
    const targetIndex = Math.max(0, Math.min(sections.length - 1, index));
    const target = sections[targetIndex];
    if (!target) return;
    updateControls(targetIndex);
    target.classList.remove('page-turn-enter');
    void target.offsetWidth;
    target.classList.add('page-turn-enter');
    target.scrollIntoView({
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const selector = link.getAttribute('href');
      const target = selector && document.querySelector(selector);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  prev?.addEventListener('click', () => go(active - 1));
  next?.addEventListener('click', () => go(active + 1));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) updateControls(sections.indexOf(visible.target));
    }, { rootMargin: '-18% 0px -42% 0px', threshold: [0, .15, .3, .5, .7] });
    sections.forEach(section => observer.observe(section));
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateControls(0);
  updateProgress();

  // El ambiente sonoro continúa siendo opcional y requiere una acción explícita.
  const sound = document.getElementById('soundToggle');
  let audio = null;
  let oscillators = [];
  sound?.addEventListener('click', async () => {
    if (audio) {
      oscillators.forEach(node => {
        try { node.stop(); node.disconnect(); } catch (_) {}
      });
      oscillators = [];
      await audio.close();
      audio = null;
      sound.classList.remove('is-selected');
      sound.setAttribute('aria-label', 'Activar ambiente sonoro');
      sound.title = 'Ambiente sonoro desactivado';
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      sound.title = 'Este navegador no permite ambiente sonoro';
      return;
    }
    audio = new AudioContextClass();
    await audio.resume();
    const master = audio.createGain();
    master.gain.value = .012;
    master.connect(audio.destination);
    [174.61, 261.63, 349.23].forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 0 ? .45 : .18;
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start();
      oscillators.push(oscillator);
    });
    sound.classList.add('is-selected');
    sound.setAttribute('aria-label', 'Desactivar ambiente sonoro');
    sound.title = 'Ambiente sonoro activado';
  });
})();