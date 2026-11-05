/* Consentimento de cookies (LGPD) — hestiabim.com
 *
 * O Consent Mode v2 começa negado no <head> de cada página; aqui só
 * coletamos a escolha e mandamos o "update" para o gtag. A mesma lógica
 * está embutida no app (app/index.html), que é um arquivo único.
 */
(function () {
  'use strict';

  var CHAVE = 'hestia:consent';

  function ler() {
    try {
      return localStorage.getItem(CHAVE);
    } catch (e) {
      return null;
    }
  }

  function gravar(valor) {
    try {
      localStorage.setItem(CHAVE, valor);
    } catch (e) {}
  }

  function aplicar(valor) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: valor === 'granted' ? 'granted' : 'denied'
    });
  }

  function fechar() {
    var caixa = document.getElementById('hestia-consent');
    if (caixa) caixa.remove();
  }

  function montar() {
    if (document.getElementById('hestia-consent')) return;

    var caixa = document.createElement('div');
    caixa.id = 'hestia-consent';
    caixa.setAttribute('role', 'region');
    caixa.setAttribute('aria-label', 'Preferências de cookies');
    caixa.style.cssText =
      'position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;' +
      'max-width:430px;padding:16px 18px;border-radius:14px;' +
      'background:#0e0e11;color:#f4efe6;border:1px solid rgba(244,239,230,.16);' +
      'box-shadow:0 18px 50px rgba(0,0,0,.5);' +
      "font-family:'Inter Tight',system-ui,-apple-system,'Segoe UI',sans-serif;" +
      'font-size:13.5px;line-height:1.5;';

    var titulo = document.createElement('p');
    titulo.textContent = 'Cookies e medição';
    titulo.style.cssText = 'margin:0 0 6px;font-size:13px;font-weight:600;';

    var texto = document.createElement('p');
    texto.textContent =
      'Uso o Google Analytics para saber quantas pessoas visitam o site e quais páginas ajudam mais. Nada é medido sem o seu aceite.';
    texto.style.cssText = 'margin:0;color:#b9b2a7;';

    var acoes = document.createElement('div');
    acoes.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;';

    var recusar = document.createElement('button');
    recusar.type = 'button';
    recusar.textContent = 'Recusar';
    recusar.style.cssText =
      'font:inherit;font-size:13px;font-weight:500;padding:9px 16px;' +
      'border-radius:999px;cursor:pointer;background:transparent;color:#e8e2d7;' +
      'border:1px solid rgba(244,239,230,.24);';

    var aceitar = document.createElement('button');
    aceitar.type = 'button';
    aceitar.textContent = 'Aceitar';
    aceitar.style.cssText =
      'font:inherit;font-size:13px;font-weight:500;padding:9px 16px;' +
      'border-radius:999px;cursor:pointer;background:#ff6a3d;color:#14100e;' +
      'border:1px solid #ff6a3d;';

    recusar.addEventListener('click', function () {
      gravar('denied');
      aplicar('denied');
      fechar();
    });

    aceitar.addEventListener('click', function () {
      gravar('granted');
      aplicar('granted');
      fechar();
    });

    acoes.appendChild(recusar);
    acoes.appendChild(aceitar);
    caixa.appendChild(titulo);
    caixa.appendChild(texto);
    caixa.appendChild(acoes);
    document.body.appendChild(caixa);
  }

  function iniciar() {
    var escolha = ler();
    if (escolha === 'granted' || escolha === 'denied') {
      aplicar(escolha);
      return;
    }
    montar();
  }

  window.hestiaConsent = { abrir: montar, escolha: ler };

  document.addEventListener('click', function (evento) {
    var gatilho = evento.target && evento.target.closest
      ? evento.target.closest('[data-consent-open]')
      : null;
    if (!gatilho) return;
    evento.preventDefault();
    montar();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
