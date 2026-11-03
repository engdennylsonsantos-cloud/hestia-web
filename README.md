# hestiabim.com

Landing page estática do **Hestia** — BIM open source no navegador.
Sem framework, sem build: HTML + CSS + um pouco de JavaScript.

Repositório público: <https://github.com/engdennylsonsantos-cloud/Hestia>

Licença: **MIT**, sem CLA. Contribuições entram sob MIT e não geram pagamento nem
royalty. O app é gratuito. Detalhes no repositório do produto:
`hestia-gpu/LICENSING.md`, `hestia-gpu/CONTRIBUTING.md` e `hestia-gpu/NOTICE`.

O app completo também está publicado aqui, em [`app/`](app/), então o botão
**Abrir o Hestia** funciona de verdade no mesmo domínio.

## Estrutura

```
site/
├── index.html                    página
├── 404.html                      página de erro
├── styles.css                    estilos (tema escuro + seção clara)
├── app.js                        menu, header e revelações
├── favicon.svg
├── robots.txt · sitemap.xml
├── assets/
│   ├── hestia-h.svg              símbolo H (header/rodapé)
│   ├── hestia-icon.svg           ícone de app (favicon/OG)
│   ├── icon-512.png              ícone para apple-touch-icon
│   ├── modelo-3d.png             captura com interface (hero)
│   ├── modelo-3d.webp            mesma captura em WebP (usada no hero)
│   ├── modelo-3d-canvas.png      captura sem interface (galeria)
│   ├── planta.png · planta-close.png
│   ├── og.png                    imagem de compartilhamento (1200×630)
│   └── casa-terrea-2-quartos.hestia.json   projeto de exemplo
├── app/                          build de produção do Hestia (gerado)
│   ├── index.html
│   └── resolveWorker-*.js
└── scripts/                      captura de imagens e revisão (não vai para produção)
```

## Rodar localmente

```powershell
cd site
python -m http.server 5300
# abra http://127.0.0.1:5300
```

O app em `/app/` é um build estático e abre sem servidor de aplicação.

## Publicar

O site é 100% estático. Em qualquer host (Cloudflare Pages, Netlify, Vercel,
GitHub Pages, S3), publique a pasta `site/` como raiz.

### Cloudflare Pages (sugestão)

1. Crie um projeto em **Workers & Pages → Pages → Upload assets**.
2. Envie a pasta `site/` (sem `scripts/`).
3. Em **Custom domains**, adicione `hestiabim.com` e `www.hestiabim.com`.
4. No registrador, aponte o DNS para o Cloudflare (nameservers) ou use os
   registros CNAME indicados pelo Pages.

Se preferir deploy por Git, configure:

- **Build command:** *(vazio)*
- **Output directory:** `site`

### Contato

O site não publica e-mail por enquanto. O contato é pelo GitHub, em
[issues](https://github.com/engdennylsonsantos-cloud/Hestia/issues).
Quando houver um endereço de e-mail, adicione-o no FAQ e no rodapé de
`index.html`.

## Atualizar o app em `/app/`

O build é gerado no repositório do produto:

```powershell
cd ..\hestia-gpu
npm run build
Copy-Item apps\web\dist\index.html ..\site\app\index.html -Force
Copy-Item apps\web\dist\resolveWorker-*.js ..\site\app\ -Force
Copy-Item apps\web\dist\ifcWorker-*.js ..\site\app\ -Force
```

Se o nome dos workers mudar, apague os arquivos antigos de `site/app/` antes. O `ifcWorker` é usado pela
importação IFC; sem ele, o app abre mas a importação falha.

## Regerar as imagens

As capturas saem do app rodando (não são mockups). Requer o Chrome instalado
e o `playwright-core` do repositório do Hestia.

```powershell
# terminal 1 — app
cd ..\hestia-gpu\apps\web
npx vite --port 5200 --strictPort

# terminal 2 — capturas
cd ..\..\..\site
node scripts/capture.mjs   # hero, planta, detalhe e 3D
node scripts/og.mjs        # imagem Open Graph
```

`scripts/casa-demo.hestia.json` é a casa usada nas capturas (a fixture do app,
sem as duas paredes de teste que ficavam soltas). Ela também é o download de
exemplo em `assets/`.

Os scripts `review.mjs` e `qa.mjs` geram capturas de conferência e checam
links, imagens, menu e overflow.

## Antes de publicar — revisar

- [ ] `LICENSE` (MIT), `LICENSING.md`, `CONTRIBUTING.md` e `NOTICE` commitados e visíveis no GitHub.
- [ ] `app/` é o build mais recente do produto.
- [ ] Imagens continuam batendo com a interface atual.
- [ ] `og.png` e as metas `og:*` apontam para `https://www.hestiabim.com`.
- [ ] Analytics/privacidade: o site não usa cookies, mas carrega fontes do Google.
      Se quiser eliminar a dependência, baixe as fontes e sirva de `assets/fonts/`.

## Notas de design

- Tema escuro com um painel claro na seção open source e uma seção clara (honestidade), para quebrar o ritmo.
- Cor de destaque: brasa (`#ff6a3d`), ligada ao nome Hestia (deusa do lar e do fogo).
- Tipografia: Inter Tight (títulos e texto), Instrument Serif itálico (destaques)
  e IBM Plex Mono (rótulos), a mesma família mono usada dentro do app.
- As imagens são capturas reais do produto, incluindo a interface — sem render.
- Sem código na landing: a seção open source fala de liberdade, não de arquitetura interna.
