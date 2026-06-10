# NHF Resultater

Nettapplikasjon for Norges Hesteskokastingsforbund. Viser resultat, terminliste, Norgescup, Norgesranking, rekorder og meir.

**Prod:** [res.hesteskokasting.no](https://res.hesteskokasting.no)
**Dev:** [res.hesteskokasting.no/dev](https://res.hesteskokasting.no/dev)

---

## Krav

- [Node.js](https://nodejs.org/) v20 eller nyare
- [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install) (Windows Subsystem for Linux) — påkravd av Docker Desktop
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — påkravd for lokal Supabase-stack og integrasjonstesting

---

## Oppsett på ny maskin

### 1. WSL 2 og Docker Desktop

WSL 2 må installerast før Docker Desktop. Køyr i PowerShell som administrator:

```powershell
wsl --install
```

Start maskinen på nytt når du vert beden om det. Installer deretter Docker Desktop:

```powershell
winget install Docker.DockerDesktop
```

Start Docker Desktop og vent til det grøne ikonet i systembrettet viser at det køyrer.

### 2. Klon og installer avhengigheiter

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
| `npm run test` | Køyrer Vitest i watch-modus — re-køyrer testar ved kvar filendring |
| `npm run test:run` | Eingongskøyring av alle testar — bruk dette før commit og i CI |
| `npm run typecheck:test` | Typesjekkjer testfilene (Vitest brukar esbuild, ikkje tsc — dette er einaste typesjekkinga av `tests/`) |
| `npm run test:db` | Køyrer pgTAP-integrasjonstestane mot lokal Supabase-stack (krev `npx supabase start` fyrst) |

**Du treng ikkje køyre `build` eller `dev` før du pushar.** GitHub Actions byggjer automatisk når du pushar:

- Push til `dev` → GitHub Actions byggjer og deployer til `res.hesteskokasting.no/dev`
- Push til `main` → GitHub Actions byggjer, ventar på manuell godkjenning, deployer til `res.hesteskokasting.no`

`npm run build` lokalt er berre nyttig viss du vil stadfeste at koden kompilerer utan å pushe, eller feilsøke byggfeil.

---

## Testing

Prosjektet nyttar [Vitest](https://vitest.dev/) med [happy-dom](https://github.com/capricorn86/happy-dom) for einingstesting av rein logikk.

Testfiler ligg i `tests/` og importerer frå `@/`-aliaset. Testane dekker berre funksjonar utan Supabase-kall — logikk som er samanvevd med databasekall vert fyrst ekstrahert til ein rein funksjon, deretter testa.

Tre kommandoar skal køyrast og vere grøne før kvar commit:

```bash
npm run typecheck && npm run typecheck:test && npm run test:run
```

Konfigurasjon: `vite.config.js` (test-blokk) og `tsconfig.test.json`.

### Integrasjonstesting (pgTAP)

Integrasjonstestane verifiserer databaselaget: RLS-politikkar og `SECURITY DEFINER`-funksjonar. Testfilene ligg i `supabase/tests/` og køyrer mot ein lokal Supabase-stack.

**Krav:** WSL 2 og Docker Desktop må vere installert og køyrande (sjå [Oppsett på ny maskin](#oppsett-på-ny-maskin)).

```bash
npx supabase start   # startar lokal Postgres og køyrer alle migreringsfiler
npm run test:db      # køyrer alle pgTAP-testar i supabase/tests/
npx supabase stop    # stoppar lokal stack når du er ferdig
```

Køyr integrasjonstestane når du endrar migreringsfiler, RLS-politikkar eller `SECURITY DEFINER`-funksjonar. Dei er ikkje ein del av den raske pre-commit-sjekkanen (Vitest).

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

### Oppdater TypeScript-typar

Når du gjer endringar i databaseskjemaet, regenerer `src/types/database.types.ts`:

```bash
npx supabase gen types typescript --project-id abcdefghijkl123456 > src/types/database.types.ts
```

**Viktig:** Bruk `>` og ikkje `2>&1`. Supabase MCP-pluginen kan injisere ein `<claude-code-hint>`-tag på slutten av fila viss stderr vert omdirigert — denne taggen gjer fila ugyldig TypeScript.

---

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
├── app.ts                  # SPA-ruter
├── supabase.ts             # Supabase-klient
├── admin/                  # Admin-sider (kaster, klubb, stevne)
├── components/             # Gjenbrukbare UI-faktoriar (create<Name>)
│   ├── ConfirmDialog.ts
│   ├── EmptyState.ts
│   ├── ErrorBanner.ts
│   ├── LoadingState.ts
│   ├── PromptDialog.ts
│   ├── Scoreboard.ts
│   ├── ScoreNumberpad.ts
│   ├── Table.ts
│   ├── Tabs.ts
│   └── Toast.ts
├── organizer/              # Stevne-arrangør-verktøy (gruppefordeling, startkort)
├── pages/                  # Tynne rutehandterar; koplar komponentar + tenester
│   └── stevne/             # Stevne-undersider
│       ├── innledende/     # Kastemetode-spesifikk innledende-logikk
│       └── avsluttende/    # Kastemetode-spesifikk avsluttende-logikk
├── services/               # Alle Supabase-spørjingar og eksterne API-kall
├── types/                  # Delte typar, inkl. generert database.types.ts
└── utils/                  # Reine hjelpe­funksjonar (ingen Supabase, ingen DOM)

supabase/
└── migrations/             # SQL-migreringsfiler

tests/                      # Vitest-testar for rein logikk (utils og service-funksjonar utan Supabase-kall)
```
