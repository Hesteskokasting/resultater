# NHF Resultater

Nettapplikasjon for Norges Hesteskokastingsforbund. Viser resultat, terminliste, Norgescup, Norgesranking, rekorder og meir.

**Prod:** [res.hesteskokasting.no](https://res.hesteskokasting.no)
**Dev:** [res.hesteskokasting.no/dev](https://res.hesteskokasting.no/dev)

---

## Krav

- [Node.js](https://nodejs.org/) v20 eller nyare

---

## Oppsett på ny maskin

```bash
git clone https://github.com/hesteskokasting/resultater.git
cd resultater
npm install
```

Opprett `.env.local` i rota med Supabase-nøklar for **dev**-prosjektet:

```
VITE_SUPABASE_URL=https://<dev-prosjekt>.supabase.co
VITE_SUPABASE_ANON_KEY=<dev-anon-nøkkel>
```

Start dev-server:

```bash
npm run dev
```

Appen er tilgjengeleg på `http://localhost:5173`.

---

## Kommandoar

| Kommando | Når du brukar det |
|---|---|
| `npm run dev` | Under utvikling — startar lokal Vite-dev-server med hot reload |
| `npm run build` | For å sjekke at prod-bygget fungerer lokalt før du pushar |
| `npm run preview` | Køyrer det ferdige `dist/`-bygget lokalt, nyttig for å teste prod-åtferd |

**Du treng ikkje køyre `build` eller `dev` før du pushar.** GitHub Actions byggjer automatisk når du pushar:

- Push til `dev` → GitHub Actions byggjer og deployer til `res.hesteskokasting.no/dev`
- Push til `main` → GitHub Actions byggjer, ventar på manuell godkjenning, deployer til `res.hesteskokasting.no`

`npm run build` lokalt er berre nyttig viss du vil stadfeste at koden kompilerer utan å pushe, eller feilsøke byggfeil.

---

## Branchar og deployment

| Branch | Miljø | URL |
|---|---|---|
| `main` | Produksjon | `res.hesteskokasting.no` |
| `dev` | Dev | `res.hesteskokasting.no/dev` |

Push til `main` triggar GitHub Actions-workflow som byggjer og deployer til GitHub Pages. **Produksjon krev manuell godkjenning** i GitHub → Environments → `github-pages`.

**Angrar du etter push til `main`?** Du har to val:

- **Før du har godkjent deployen:** Gå til GitHub → Actions → den køyrande workflowen → klikk **"Reject"** i godkjenningssteget. Ingenting vert publisert, og du kan rette opp med ein ny commit.
- **Etter godkjenning (feil allereie live):** Køyr `git revert HEAD` lokalt og push til `main`. Dette lagar ein ny commit som angrar endringane, og triggrar ein ny deploy med den forrige versjonen.

Push til `dev` deployer automatisk til dev-miljøet utan godkjenning.

---

## Supabase-migrering

Prosjektet brukar Supabase CLI for databasemigrering. Migreringsfiler ligg i `supabase/migrations/`.

### Koble til eit prosjekt

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

Project ref finn du på [supabase.com](https://supabase.com) → prosjektet → Settings → General.

### Lag ein ny migrasjon

```bash
npx supabase migration new <namn_på_migrasjon>
```

Rediger den nye `.sql`-fila i `supabase/migrations/`, køyr deretter:

```bash
npx supabase db push
```

### Miljø

- **Dev:** koble til dev-prosjektet og køyr `npx supabase db push`
- **Prod:** same prosedyre, men koble til prod-prosjektet (bytt `--project-ref`)

---

## GitHub-konfigurasjon

Følgjande secrets må vere satt opp under **Settings → Environments**:

**Environment: `github-pages` (prod)**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Environment: `dev`**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Når du koplar inn Supabase-migrering i CI, trengst òg:
- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN` (frå supabase.com → Account → Access tokens)

---

## Prosjektstruktur

```
src/
├── index.html          # Inngangspunkt
├── app.js              # SPA-ruter
├── supabase.js         # Supabase-klient
├── global.css          # Globale stilar og tema (mørk/lys)
├── styles.css          # App-stilar
├── pages/              # Sider (home, resultat, kastere, osv.)
├── admin/              # Admin-sider
├── organizer/          # Stevne-arrangør-verktøy
├── scoring/            # Scoringsystem
└── utils/              # Delt logikk

supabase/
└── migrations/         # SQL-migreringsfiler
```
