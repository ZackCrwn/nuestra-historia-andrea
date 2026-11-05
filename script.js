(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('main>section')];
  const names = ['PORTADA','ANTES DE LA HISTORIA','CAPÍTULO I','CAPÍTULO II','CAPÍTULO III · FAMILIA','CAPÍTULO IV','CAPÍTULO V','CAPÍTULO VI · ANTONIO','CAPÍTULO VII','EPÍLOGO','CIERRE'];
  const label = document.getElementById('pageLabel');
  const prev = document.getElementById('previousPage');
  const next = document.getElementById('nextPage');
  let active = 0;
  function updateControls(index) {
    active = Math.max(0, Math.min(sections.length - 1, index));
    if (label) label.textContent = names[active] || 'NUESTRA HISTORIA';
    if (prev) prev.disabled = active === 0;
    if (next) next.disabled = active === sections.length - 1;
  }
  function go(index) {
    const targetIndex = Math.max(0, Math.min(sections.length - 1, index));
    if (targetIndex === active && sections[targetIndex]) {
      sections[targetIndex].scrollIntoView({behavior: reduceMotion.matches ? 'auto' : 'smooth', block:'start'});
      return;
    }
    sections[active]?.classList.remove('page-turn-enter');
    updateControls(targetIndex);
    const target = sections[active];
    target?.classList.remove('page-turn-enter');
    void target?.offsetWidth;
    target?.classList.add('page-turn-enter');
    target?.scrollIntoView({behavior: reduceMotion.matches ? 'auto' : 'smooth', block:'start'});
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({behavior: reduceMotion.matches ? 'auto' : 'smooth', block:'start'});
    });
  });
  prev?.addEventListener('click', () => go(active - 1));
  next?.addEventListener('click', () => go(active + 1));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) updateControls(sections.indexOf(visible.target));
    }, {threshold:[.25,.5,.75]});
    sections.forEach(section => observer.observe(section));
  }
  updateControls(0);

  // Ambiente opcional: se activa únicamente cuando la persona pulsa el control.
  const sound = document.getElementById('soundToggle');
  let audio = null, nodes = [];
  sound?.addEventListener('click', async () => {
    if (audio) {
      nodes.forEach(node => { try { node.stop?.(); node.disconnect?.(); } catch (_) {} });
      await audio.close();
      audio = null; nodes = [];
      sound.classList.remove('is-selected');
      sound.setAttribute('aria-label','Activar ambiente sonoro');
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) { sound.title = 'Este navegador no permite ambiente sonoro'; return; }
    audio = new AudioContextClass();
    await audio.resume();
    const master = audio.createGain();
    master.gain.value = 0.018;
    master.connect(audio.destination);
    [174.61,261.63,349.23].forEach((frequency,index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 0 ? .55 : .22;
      oscillator.connect(gain); gain.connect(master); oscillator.start();
      nodes.push(oscillator);
    });
    nodes.push(master);
    sound.classList.add('is-selected');
    sound.setAttribute('aria-label','Desactivar ambiente sonoro');
  });
})();