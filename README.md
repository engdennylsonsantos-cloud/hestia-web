# hestiabim.com

Landing page estática do **Hestia** — BIM open source no navegador.
Sem framework, sem build: HTML + CSS + um pouco de JavaScript.

Repositório público: <https://github.com/engdennylsonsantos-cloud/Hestia>

Licença: **MIT**, sem CLA. Contribuições entram sob MIT e não geram pagamento nem
royalty. O app é gratuito. Detalhes no repositório do produto:
`Hestia/LICENSING.md`, `Hestia/CONTRIBUTING.md` e `Hestia/NOTICE`.

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
├── app/                          build de produção do Hestia (sincronizado do Release)
│   ├── index.html                arquivo único com o app
│   ├── geom_wasm.wasm            kernel geométrico experimental
│   ├── avisosWorker-*.js         worker de avisos de cálculo
│   ├── ifcWorker-*.js            worker da importação IFC
│   └── resolveWorker-*.js        worker de resolução geométrica
└── scripts/                      captura de imagens e revisão (não vai para produção)
```

## Rodar localmente

```powershell
cd hestia-web
npx --yes serve . -l 5300
# abra http://127.0.0.1:5300
```

O app em `/app/` é um build estático e abre sem servidor de aplicação.

## Publicar

O site é estático e está publicado na **Vercel**, no projeto `hestia`, com
integração Git: **todo push em `main` publica**. Não há build — a Vercel serve
o repositório como está, respeitando o `.vercelignore` (`scripts/`, `README.md`
e `DEPLOY.md` não vão para produção).

Domínios: `www.hestiabim.com` (principal) e `hestiabim.com` (redireciona para o www).
Deploy manual pela CLI, como plano B, está em `DEPLOY.md`.

## Contato

O site não publica e-mail por enquanto. O contato é pelo GitHub, em
[issues](https://github.com/engdennylsonsantos-cloud/Hestia/issues).
Quando houver um endereço de e-mail, adicione-o no FAQ e no rodapé de
`index.html`.

## Atualizar o app em `/app/`

Não se copia mais arquivo à mão. O workflow `.github/workflows/sincronizar-app.yml`
roda a cada 15 minutos (ou em Actions → **sincronizar app** → *Run workflow*) e:

1. lê a última release publicada em `engdennylsonsantos-cloud/Hestia`;
2. baixa `index.html`, os três workers e `geom_wasm.wasm` dos assets do Release;
3. confere a meta `<meta name="hestia-version">` do HTML contra a tag;
4. substitui `app/` e commita (`app: sincroniza vX.Y.Z`), o que dispara o deploy;
5. espera o site publicar e falha se a versão servida em `/app` não bater.

Na máquina, o mesmo caminho:

```powershell
node scripts/sincronizar-app.mjs                                  # última release
node scripts/sincronizar-app.mjs v0.2.1                           # uma tag
node scripts/sincronizar-app.mjs --dist ../Hestia/apps/web/dist  # build local
```

## Regerar as imagens

As capturas saem do app rodando (não são mockups). Requer o Chrome instalado
e o `playwright-core` do repositório do Hestia.

```powershell
# terminal 1 — app
cd ../Hestia/apps/web
npx vite --port 5200 --strictPort

# terminal 2 — capturas
cd ../../../hestia-web
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
- [ ] `app/` está sincronizado com a última release (o workflow cuida; confira a meta `hestia-version`).
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
