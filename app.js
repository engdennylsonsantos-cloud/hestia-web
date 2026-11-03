(() => {
  const header = document.querySelector('[data-header]');
  const menuBtn = document.querySelector('[data-menu-btn]');
  const menu = document.querySelector('[data-mobile-menu]');

  /* Cabeçalho com fundo depois do primeiro trecho */
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 16);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Menu móvel */
  const fecharMenu = () => {
    if (!menu || !menuBtn) return;
    menu.hidden = true;
    document.body.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menu');
  };

  if (menu && menuBtn) {
    menuBtn.addEventListener('click', () => {
      const aberto = menuBtn.getAttribute('aria-expanded') === 'true';
      menu.hidden = aberto;
      document.body.classList.toggle('menu-open', !aberto);
      menuBtn.setAttribute('aria-expanded', String(!aberto));
      menuBtn.setAttribute('aria-label', aberto ? 'Abrir menu' : 'Fechar menu');
    });

    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) fecharMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') fecharMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1080) fecharMenu();
    });
  }

  /* Revelação suave ao rolar */
  const alvos = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('is-in');
            observador.unobserve(entrada.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    alvos.forEach((el) => observador.observe(el));
  } else {
    alvos.forEach((el) => el.classList.add('is-in'));
  }

  /* Ano do rodapé */
  const ano = document.querySelector('[data-year]');
  if (ano) ano.textContent = String(new Date().getFullYear());
})();
