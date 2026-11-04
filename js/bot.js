// VELO — scripted assistant (v1: buttons, no AI). Rive animation replaces the CSS blob later.
(() => {
  const velo = document.querySelector('.velo');
  if (!velo) return;
  const avatar = velo.querySelector('.velo-avatar');
  const KEY = 'velo-dismissed';

  const store = {
    get() { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } },
    set() { try { sessionStorage.setItem(KEY, '1'); } catch { /* storage blocked */ } },
  };

  const setState = (s) => (velo.dataset.state = s);
  const setView = (v) => (velo.dataset.view = v);

  let shown = false;
  const appear = () => {
    if (shown) return;
    shown = true;
    window.removeEventListener('scroll', onScroll);
    if (store.get()) { setState('idle'); return; }   // dismissed this session: avatar only
    setState('idle');
    setTimeout(() => {
      setView('greet');
      setState('open');
      velo.classList.add('wave');
      setTimeout(() => velo.classList.remove('wave'), 1900);
    }, 700);
  };

  // appear after 8s or 40% scroll, whichever first
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max > 0 && scrollY / max >= 0.4) appear();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  setTimeout(appear, 8000);

  // if the visitor ignores the bubble and keeps scrolling, fold back to the avatar
  let openedAt = null, touched = false;
  velo.addEventListener('pointerdown', () => (touched = true));
  new MutationObserver(() => { if (velo.dataset.state === 'open') { openedAt = scrollY; touched = false; } })
    .observe(velo, { attributes: true, attributeFilter: ['data-state'] });
  window.addEventListener('scroll', () => {
    if (velo.dataset.state === 'open' && !touched && openedAt !== null && Math.abs(scrollY - openedAt) > 900) setState('idle');
  }, { passive: true });

  avatar.addEventListener('click', () => {
    if (velo.dataset.state === 'open') { setState('idle'); return; }
    setView('greet');
    setState('open');
  });

  velo.querySelector('.velo-x').addEventListener('click', () => { store.set(); setState('idle'); });

  velo.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) {
      const v = go.dataset.go;
      if (v === 'work') {
        setState('idle');
        const w = document.querySelector('#work');
        if (window.__lenis) window.__lenis.scrollTo(w, { offset: -70 }); else w.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      setView(v);
      return;
    }
    if (e.target.closest('[data-close], [data-cal]')) setState('idle');
    if (e.target.closest('[data-whatsapp]')) {
      e.preventDefault();
      // TODO: wa.me link with the studio number
    }
  });

  // eyes follow the cursor
  addEventListener('pointermove', (e) => {
    const r = avatar.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(d / 300, 1) * 5;
    avatar.style.setProperty('--ex', `${(dx / d) * k}px`);
    avatar.style.setProperty('--ey', `${(dy / d) * k}px`);
  }, { passive: true });

  addEventListener('keydown', (e) => { if (e.key === 'Escape' && velo.dataset.state === 'open') setState('idle'); });
})();
