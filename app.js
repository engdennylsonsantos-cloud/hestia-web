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

  /* Versões do GitHub Releases: a página lê as releases publicadas, então cada versão nova aparece sozinha,
     sem republicar o site. Se a API falhar, ficam os dados escritos no HTML (última versão conhecida). */
  (() => {
    const REPO = 'engdennylsonsantos-cloud/Hestia';
    const BASE = `https://github.com/${REPO}/`;
    const secao = document.getElementById('baixar');
    if (!secao || !('fetch' in window)) return;

    const el = (sel) => secao.querySelector(sel);
    const seguro = (url) => typeof url === 'string' && url.startsWith(BASE) && !/[\s"'<>]/.test(url);
    const dataBr = (iso) => {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
    };
    const mb = (bytes) => (bytes >= 1048576 ? `${Math.round(bytes / 1048576)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
    const instalador = (r) => (r.assets || []).find((a) => /x64-setup\.exe$/i.test(a.name || '') && seguro(a.browser_download_url));
    const rotulo = (r) => String(r.name || r.tag_name || '').replace(/^hestia\s*/i, '') || String(r.tag_name || '');

    const linha = (r) => {
      const li = document.createElement('li');
      const nome = document.createElement('span');
      nome.className = 'dl-v';
      nome.textContent = rotulo(r);
      if (r.prerelease) {
        const tag = document.createElement('span');
        tag.className = 'dl-tag';
        tag.textContent = 'pré-lançamento';
        nome.appendChild(tag);
      }
      const data = document.createElement('span');
      data.className = 'dl-d';
      data.textContent = dataBr(r.published_at || r.created_at);
      const links = document.createElement('span');
      links.className = 'dl-links';
      const exe = instalador(r);
      if (exe) {
        const a = document.createElement('a');
        a.href = exe.browser_download_url;
        a.textContent = `Windows · ${mb(exe.size)}`;
        links.appendChild(a);
      }
      if (seguro(r.html_url)) {
        const a = document.createElement('a');
        a.href = r.html_url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = 'Notas';
        links.appendChild(a);
      }
      li.append(nome, data, links);
      return li;
    };

    const aplicar = (releases) => {
      const publicadas = releases
        .filter((r) => r && !r.draft && r.tag_name)
        .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
      const estaveis = publicadas.filter((r) => !r.prerelease);
      const ultima = estaveis[0] || publicadas[0];
      if (!ultima) return;

      const titulo = el('[data-dl-version]');
      if (titulo) titulo.textContent = `Hestia ${ultima.tag_name}`;
      const data = el('[data-dl-date]');
      if (data) data.textContent = dataBr(ultima.published_at || ultima.created_at);
      const exe = instalador(ultima);
      const botao = el('[data-dl-installer]');
      if (botao && exe) {
        botao.href = exe.browser_download_url;
        const tam = el('[data-dl-size]');
        if (tam) tam.textContent = `· ${mb(exe.size)}`;
      } else if (botao) {
        botao.href = `${BASE}releases/latest`;
      }
      const notas = el('[data-dl-notes]');
      if (notas && seguro(ultima.html_url)) notas.href = ultima.html_url;

      const lista = el('[data-dl-list]');
      if (!lista) return;
      const anteriores = publicadas.filter((r) => r !== ultima);
      lista.textContent = '';
      if (!anteriores.length) {
        const vazio = document.createElement('li');
        vazio.className = 'dl-empty';
        vazio.textContent = 'Esta é a primeira versão publicada.';
        lista.appendChild(vazio);
        return;
      }
      for (const r of anteriores) lista.appendChild(linha(r));
    };

    const CHAVE = 'hestia:releases';
    try {
      const guardado = JSON.parse(sessionStorage.getItem(CHAVE) || 'null');
      if (guardado && Date.now() - guardado.em < 10 * 60 * 1000 && Array.isArray(guardado.dados)) {
        aplicar(guardado.dados);
        return;
      }
    } catch {
      /* sessionStorage indisponível: segue para a rede */
    }

    fetch(`https://api.github.com/repos/${REPO}/releases?per_page=30`, { headers: { Accept: 'application/vnd.github+json' } })
      .then((resp) => (resp.ok ? resp.json() : Promise.reject(new Error(String(resp.status)))))
      .then((dados) => {
        if (!Array.isArray(dados)) return;
        aplicar(dados);
        try {
          sessionStorage.setItem(CHAVE, JSON.stringify({ em: Date.now(), dados }));
        } catch {
          /* sem cache */
        }
      })
      .catch(() => {
        /* mantém a última versão conhecida escrita no HTML */
      });
  })();
})();
