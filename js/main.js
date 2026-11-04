// VeloxLab — page behavior: smooth scroll, nav, reveals, forms
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');

  // Lenis smooth scroll (optional — page works without it)
  let lenis = null;
  window.addEventListener('load', () => {
    if (reduce || typeof window.Lenis !== 'function') return;
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) });
    window.__lenis = lenis;
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  });

  // anchor links -> smooth scroll with nav offset
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#' || a.hasAttribute('data-cal') || a.hasAttribute('data-whatsapp')) {
      if (id === '#') e.preventDefault();
      return;
    }
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.scrollTo(el, { offset: id === '#top' ? 0 : -70 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  // nav state
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // reveal on enter, once
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 4) * 80}ms`;
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // forms (draft: no backend yet — validate + show success)
  document.querySelectorAll('form[data-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('input[required]').forEach((inp) => {
        const bad = !inp.value.trim() || (inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(inp.value));
        inp.classList.toggle('bad', bad);
        if (bad && ok) { inp.focus(); ok = false; }
      });
      if (!ok) return;
      form.querySelector('.form-ok').hidden = false;
      form.querySelector('button[type="submit"]').disabled = true;
      // TODO: POST to the outreach pipeline (n8n / Supabase / Formspree)
    });
  });

  // Booking placeholder (Cal.com link goes here)
  document.querySelectorAll('[data-cal]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: replace with Cal.com embed / link
    const c = document.querySelector('#contact');
    if (lenis) lenis.scrollTo(c, { offset: -70 }); else c.scrollIntoView({ behavior: 'smooth' });
  }));
})();
