#!/usr/bin/env node
/**
 * Sincroniza `app/` com o app web publicado no Release do Hestia.
 *
 * Por que existe: o `/app` do site é um build estático que antes era copiado à mão. Em novembro de
 * 2026 ele ficou dois releases atrasado sem ninguém notar. Este script é a única forma de o site
 * receber o app: pega os assets do Release, confere a versão carimbada no HTML e substitui os
 * arquivos em `app/`.
 *
 * Uso:
 *   node scripts/sincronizar-app.mjs                 # última release publicada
 *   node scripts/sincronizar-app.mjs v0.2.1          # uma tag específica
 *   node scripts/sincronizar-app.mjs --dist ../Hestia/apps/web/dist
 *   node scripts/sincronizar-app.mjs --dist ../Hestia/apps/web/dist v0.2.1
 *
 * Código de saída: 0 = sincronizado ou já em dia; 1 = falha de validação.
 */
import { readFile, readdir, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(RAIZ, 'app');
const WRAPPER = join(RAIZ, 'scripts', 'wrapper');
const REPO = 'engdennylsonsantos-cloud/Hestia';
const MARCA_IDIOMA = 'name="hestia-version" content="';
const ID_GA = 'G-VRRV93S3QV';

const argumentos = process.argv.slice(2);
const posicaoDist = argumentos.indexOf('--dist');
const pastaDist = posicaoDist >= 0 ? argumentos[posicaoDist + 1] : null;
const tagPedida = argumentos.find((a) => a !== '--dist' && (pastaDist === null || a !== pastaDist)) ?? null;

function falhar(mensagem) {
  console.error('erro: ' + mensagem);
  process.exit(1);
}

function versaoDoHtml(html) {
  const i = html.indexOf(MARCA_IDIOMA);
  if (i < 0) return null;
  const inicio = i + MARCA_IDIOMA.length;
  return html.slice(inicio, html.indexOf('"', inicio));
}

async function baixarAssets(tag) {
  const url = tag
    ? 'https://api.github.com/repos/' + REPO + '/releases/tags/' + encodeURIComponent(tag)
    : 'https://api.github.com/repos/' + REPO + '/releases/latest';
  const cabecalhos = { Accept: 'application/vnd.github+json', 'User-Agent': 'hestia-web-sincronizar-app' };
  if (process.env.GH_TOKEN) cabecalhos.Authorization = 'Bearer ' + process.env.GH_TOKEN;

  const resposta = await fetch(url, { headers: cabecalhos });
  if (!resposta.ok) falhar('GitHub respondeu ' + resposta.status + ' em ' + url);
  const release = await resposta.json();

  const desejados = (release.assets || []).filter(
    (a) => a.name === 'index.html' || a.name === 'geom_wasm.wasm' || (a.name.endsWith('.js') && a.name.includes('Worker-')),
  );
  if (!desejados.length) falhar('release ' + release.tag_name + ' não tem os assets do app web');

  const destino = join(tmpdir(), 'hestia-app-' + Date.now());
  await mkdir(destino, { recursive: true });
  for (const asset of desejados) {
    const baixado = await fetch(asset.browser_download_url);
    if (!baixado.ok) falhar('falhou baixar ' + asset.name + ' (' + baixado.status + ')');
    await writeFile(join(destino, asset.name), Buffer.from(await baixado.arrayBuffer()));
  }
  return { pasta: destino, tag: release.tag_name };
}

async function lerWrapper() {
  const head = await readFile(join(WRAPPER, 'head.html'), 'utf8');
  const tail = await readFile(join(WRAPPER, 'tail.html'), 'utf8');
  return { head, tail };
}

function inicioDaLinha(texto, indice) {
  let i = indice;
  while (i > 0 && (texto[i - 1] === ' ' || texto[i - 1] === '\t')) i--;
  return i;
}

function inserirAntesDaLinha(pagina, ancora, bloco) {
  const i = pagina.indexOf(ancora);
  if (i < 0) throw new Error('âncora ausente: ' + ancora);
  let k = inicioDaLinha(pagina, i);
  if (k > 0 && pagina[k - 1] === '\n') k--;
  if (k > 0 && pagina[k - 1] === '\r') k--;
  return pagina.slice(0, k) + bloco + pagina.slice(k);
}

/**
 * O wrapper (Consent Mode + banner) vivia escrito à mão dentro de `app/index.html`. Builds a partir
 * da 0.2.1 já carregam o consentimento no bundle; neles a injeção é pulada para não duplicar banner.
 */
function aplicarWrapper(html, wrapper) {
  if (html.includes(ID_GA)) return html;
  const comHead = inserirAntesDaLinha(html, '<title>Hestia</title>', wrapper.head);
  return inserirAntesDaLinha(comHead, '</body>', wrapper.tail);
}

async function listarApp() {
  if (!existsSync(APP)) return [];
  const nomes = await readdir(APP);
  return nomes.filter((n) => n === 'index.html' || n === 'geom_wasm.wasm' || (n.endsWith('.js') && n.includes('Worker-')));
}

async function arquivosIguais(a, b) {
  const [ca, cb] = await Promise.all([readFile(a), readFile(b)]);
  return ca.length === cb.length && ca.equals(cb);
}

async function principal() {
  let origem;
  if (pastaDist) {
    if (!existsSync(join(pastaDist, 'index.html'))) falhar('--dist sem index.html: ' + pastaDist);
    origem = { pasta: pastaDist, tag: tagPedida };
  } else {
    origem = await baixarAssets(tagPedida);
  }

  const nomes = (await readdir(origem.pasta)).filter(
    (n) => n === 'index.html' || n === 'geom_wasm.wasm' || (n.endsWith('.js') && n.includes('Worker-')),
  );
  for (const obrigatorio of ['index.html', 'geom_wasm.wasm']) {
    if (!nomes.includes(obrigatorio)) falhar('faltou ' + obrigatorio + ' em ' + origem.pasta);
  }
  const workers = nomes.filter((n) => n !== 'index.html' && n !== 'geom_wasm.wasm');
  if (workers.length < 3) falhar('esperava 3 workers, achei ' + workers.length + ': ' + workers.join(', '));

  let html = await readFile(join(origem.pasta, 'index.html'), 'utf8');
  const versao = versaoDoHtml(html);
  if (!versao) falhar('index.html sem a meta ' + MARCA_IDIOMA + '... (build antigo?)');
  if (origem.tag) {
    const tag = origem.tag.startsWith('v') ? origem.tag : 'v' + origem.tag;
    if ('v' + versao !== tag) falhar('meta hestia-version=' + versao + ' não bate com a tag ' + tag);
  }
  for (const worker of workers) {
    if (!html.includes(worker)) falhar('index.html não referencia o worker ' + worker + ' (arquivos misturados)');
  }

  const wrapper = await lerWrapper();
  html = aplicarWrapper(html, wrapper);

  const atuais = await listarApp();
  const atualHtml = existsSync(join(APP, 'index.html')) ? await readFile(join(APP, 'index.html'), 'utf8') : '';
  const versaoAtual = versaoDoHtml(atualHtml);
  const mesmoConjunto = atuais.length === nomes.length && nomes.every((n) => atuais.includes(n));
  let conteudoIgual = mesmoConjunto;
  if (mesmoConjunto) {
    for (const nome of nomes) {
      const comparacao = nome === 'index.html' ? null : await arquivosIguais(join(APP, nome), join(origem.pasta, nome));
      if (comparacao === false) conteudoIgual = false;
      if (nome === 'index.html' && atualHtml !== html) conteudoIgual = false;
    }
  }

  if (conteudoIgual) {
    console.log('app já está na versão ' + versao + ' — nada a fazer');
    return;
  }

  await rm(APP, { recursive: true, force: true });
  await mkdir(APP, { recursive: true });
  for (const nome of nomes) {
    await writeFile(join(APP, nome), nome === 'index.html' ? Buffer.from(html) : await readFile(join(origem.pasta, nome)));
  }

  console.log('app sincronizado: ' + (versaoAtual || 'antes') + ' -> ' + versao);
  console.log('arquivos: ' + nomes.sort().join(', '));
}

principal().catch((erro) => {
  console.error('erro: ' + (erro instanceof Error ? erro.message : String(erro)));
  process.exit(1);
});
