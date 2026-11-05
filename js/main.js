// VeloxLab — page behavior: smooth scroll, nav, reveals, forms
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');

  // Lenis smooth scroll (optional — page works without it)
  let lenis = null;
  const small = matchMedia('(max-width: 860px)').matches;
  window.addEventListener('load', () => {
    // Native scroll on phones. Lenis replaces it and fights the back gesture.
    if (reduce || small || typeof window.Lenis !== 'function') return;
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
    toggle.setAttribute('aria-label', 'Open menu');
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
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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

  // Forms validate in the page. Nothing is sent yet.
  document.querySelectorAll('form[data-form]').forEach((form) => {
    const error = form.querySelector('.form-error');
    const requiredMsg = form.dataset.msgRequired || 'Fill in this field.';
    const emailMsg = form.dataset.msgEmail || 'Enter a valid email.';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const trap = form.querySelector('[name="company_website"]');
      if (trap && trap.value.trim()) return;
      let ok = true;
      let message = '';
      form.querySelectorAll('input[required], textarea[required]').forEach((inp) => {
        const value = inp.value.trim();
        const emailBad = inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(value);
        const bad = !value || emailBad;
        inp.classList.toggle('bad', bad);
        inp.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad && ok) { inp.focus(); ok = false; message = emailBad ? emailMsg : requiredMsg; }
      });
      if (error) {
        error.hidden = ok;
        error.textContent = ok ? '' : message;
      }
      if (!ok) return;
      const done = form.querySelector('.form-ok');
      if (done) done.hidden = false;
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      // TODO(owner): POST the fields, except company_website, to the form endpoint.
      // No backend is connected. Do not add a third-party form script until that URL exists.
    });
  });

  // Booking slot is #booking. Cal.com embed is not loaded yet.
  document.querySelectorAll('[data-cal]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    // TODO(owner): point this at the Cal.com link once it exists. The embed script stays out until then.
    const c = document.querySelector('#booking') || document.querySelector('#contact');
    if (lenis) lenis.scrollTo(c, { offset: -70 }); else c.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));
})();
