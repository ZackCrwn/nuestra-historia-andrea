(() => {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) { event.preventDefault(); target.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); }
  }));
  const sections = [...document.querySelectorAll('main>section')];
  const label = document.getElementById('pageLabel');
  const prev = document.getElementById('previousPage');
  const next = document.getElementById('nextPage');
  const names = ['PORTADA','ANTES DE LA HISTORIA','CAPÍTULO I','NUESTRA FAMILIA','ANTONIO','CONTINUARÁ','LA CARTA'];
  let active = 0;
  function go(index){
    active = Math.max(0, Math.min(sections.length-1,index));
    sections[active].scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    label.textContent = names[active] || 'NUESTRA HISTORIA';
    prev.disabled = active===0; next.disabled = active===sections.length-1;
  }
  prev.addEventListener('click',()=>go(active-1));
  next.addEventListener('click',()=>go(active+1));
  const observer = new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(visible){active=sections.indexOf(visible.target);label.textContent=names[active]||'NUESTRA HISTORIA';prev.disabled=active===0;next.disabled=active===sections.length-1;}
  },{threshold:[.25,.5,.75]});
  sections.forEach(section=>observer.observe(section));
  const sound=document.getElementById('soundToggle');
  let audio=null,oscillators=[];
  sound.addEventListener('click',()=>{
    if(audio){oscillators.forEach(o=>{try{o.stop()}catch(e){}});audio.close();audio=null;oscillators=[];sound.classList.remove('is-selected');sound.setAttribute('aria-label','Activar ambiente sonoro');return;}
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx){sound.title='Este navegador no permite ambiente sonoro';return;}
    audio=new Ctx();
    [174.61,261.63,349.23].forEach((freq,index)=>{
      const osc=audio.createOscillator(),gain=audio.createGain();
      osc.type='sine';osc.frequency.value=freq;gain.gain.value=index===0?.012:.006;
      osc.connect(gain);gain.connect(audio.destination);osc.start();oscillators.push(osc);
    });
    sound.classList.add('is-selected');sound.setAttribute('aria-label','Desactivar ambiente sonoro');
  });
  prev.disabled=true;
})();