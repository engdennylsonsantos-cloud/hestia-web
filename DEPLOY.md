# Publicar na Vercel com o domínio na Hostinger

> **Atualização (nov/2026):** o projeto `hestia` está conectado ao repositório `hestia-web` pela
> integração Git da Vercel — todo push em `main` publica sozinho. O workflow
> `.github/workflows/sincronizar-app.yml` copia o app da última release do Hestia para `app/`
> de hora em hora (ou na hora, em Actions → sincronizar app → Run workflow). O deploy manual
> descrito abaixo continua valendo como plano B.

Caminho escolhido: **deploy direto pela CLI**, projeto `hestia`, domínio principal
`www.hestiabim.com` e `hestiabim.com` redirecionando para o `www`.

## 1. Deploy

Abra o terminal na pasta `site`:

```powershell
cd C:\Users\Dennylson\Desktop\programas\Hestia\site
npx vercel login
npx vercel --prod
```

No primeiro comando, escolha GitHub (ou o método da sua conta) e conclua no navegador.

No `npx vercel --prod`, responda:

| Pergunta | Resposta |
|---|---|
| Set up and deploy? | `Y` |
| Which scope? | sua conta |
| Link to existing project? | `N` |
| Project name? | `hestia` |
| In which directory is your code? | `./` |
| Want to modify these settings? | `N` |

No fim, a Vercel mostra a URL de produção (`https://hestia-....vercel.app`).
Abra e confira o site e o `/app/`.

O `.vercelignore` já exclui `scripts/`, `README.md` e `DEPLOY.md` do deploy.

## 2. Adicionar os domínios na Vercel

No painel: projeto **hestia** → **Settings → Domains → Add**.

1. Adicione `www.hestiabim.com` e defina como **Primary Domain**.
2. Adicione `hestiabim.com` e escolha **Redirect to www.hestiabim.com** (308).
3. A Vercel mostra os registros DNS. Use exatamente os valores dela.

Normalmente aparece:

| Tipo | Nome | Valor |
|---|---|---|
| CNAME | `www` | `cname.vercel-dns.com` |
| A | `@` | IP que a Vercel mostrar |
| TXT | `_vercel` | token, se a Vercel pedir verificação |

Não invente o IP: copie o que estiver no painel.

## 3. DNS na Hostinger

hPanel → **Domínios → hestiabim.com → DNS / Nameservers**.

Se os nameservers forem os da Hostinger, edite a **zona DNS**:

1. Apague registros antigos de `@` e `www` que apontem para a Hostinger/parking
   (A, AAAA ou CNAME). Não apague MX/TXT se houver e-mail.
2. Crie `CNAME www → cname.vercel-dns.com`.
3. Crie `A @ → IP da Vercel`.
4. Crie o `TXT _vercel` se a Vercel pedir.
5. Salve.

Se a Hostinger mostrar "nameservers personalizados" em vez de zona DNS, edite
no provedor que estiver ali (Cloudflare etc.). O domínio continua na Hostinger.

## 4. Verificar

- Volte em **Vercel → Domains** e clique em **Refresh/Verify**.
- Espere de minutos a algumas horas (propagação).
- Quando aparecer **Valid Configuration**, o HTTPS é emitido automaticamente.
- Teste:
  - `https://www.hestiabim.com`
  - `https://hestiabim.com` (deve redirecionar para o www)
  - `https://www.hestiabim.com/app/`

Se o logo/favicon antigo aparecer, **Ctrl+F5**.
Se `/app/` der 404, confira se `app/index.html` e `app/resolveWorker-*.js` foram
enviados no deploy.

## 5. Atualizar depois

O caminho normal é **não fazer nada**: o push em `main` publica. Para forçar a sincronização do
app antes da próxima hora, rode o workflow `sincronizar-app` (Actions → Run workflow) ou, na
máquina, `node scripts/sincronizar-app.mjs` e commite.

Deploy manual, como plano B, na pasta do repositório:

```powershell
npx vercel --prod
```

## O que não precisa

- Hospedagem na Hostinger.
- Transferir o domínio.
- Servidor, banco ou SSL pago.
- Git: já está conectado; o deploy pela CLI é só plano B.
