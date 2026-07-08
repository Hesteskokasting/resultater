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

## Supabase Edge Functions

Edge Functions ligg i `supabase/functions/` og deployerast separat frå database-migreringar. Krev at prosjektet er linka (`npx supabase link`, sjå [Koble til eit prosjekt](#koble-til-eit-prosjekt)).

### Deploy

```bash
npx supabase functions deploy <namn>
```

### Sjå deployerte funksjonar

```bash
npx supabase functions list
```

### Loggar

```bash
npx supabase functions logs <namn>
npx supabase functions logs <namn> --follow   # streamer nye loggar live — nyttig medan du testar
```

### Secrets

Secrets til Edge Functions (API-nøklar o.l.) er separate frå GitHub-secrets og frå `.env.local` — dei set du direkte på Supabase-prosjektet, og dei er berre tilgjengelege server-side (aldri i klientkoden):

```bash
npx supabase secrets set NØKKEL=verdi ANNAN_NØKKEL=verdi2
npx supabase secrets list
npx supabase secrets unset NØKKEL
```

**Viktig:** `secrets list` viser berre namn, ikkje verdiar — ein secret kan settast, men aldri lesast tilbake via CLI-en. Noter verdiane i ein passordhandterar når du set dei.

### Feilsøking av pg_net-triggarar

Nokre databasetriggarar (t.d. push-varsling via `notification_queue`, sjå `supabase/migrations/20260706120400_webhook_notification_queue_to_edge_function.sql`) kallar Edge Functions direkte via `pg_net` i staden for Supabase sin innebygde «Database Webhooks»-funksjon (som krev at `supabase_functions`-schemaet er provisjonert på prosjektet — ikkje tilfelle her). For å sjå kva HTTP-svar ein slik triggar faktisk fekk, køyr i SQL-editoren:

```sql
select id, status_code, content, error_msg, created
from net._http_response
order by id desc
limit 5;
```

---

## GitHub-konfigurasjon

Følgjande secrets må vere satt opp under **Settings → Environments**:

**Environment: `github-pages` (prod)**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_WEB_CLIENT_ID` — sjå [Android (Capacitor) → Google-innlogging i den native appen](#google-innlogging-i-den-native-appen). Trengst her sjølv om det berre brukast av Android-appen, sidan appen lastar denne same produksjonsbygningen.

**Environment: `dev`**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_WEB_CLIENT_ID` (same verdi som over, eller ein eigen dev-klient viss du vil skilje dei)

Når du koplar inn Supabase-migrering i CI, trengst òg:
- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN` (frå supabase.com → Account → Access tokens)

---

## Android (Capacitor)

Appen er pakka med [Capacitor](https://capacitorjs.com) for å køyre nativt på Android. Dette er i tillegg til vanleg web-oppsett ovanfor.

### Krav på ny maskin

- [Android Studio](https://developer.android.com/studio) (siste versjon) — JDK/`keytool` følgjer med (`<Android Studio>/jbr/bin/`), ingen separat Java-installasjon nødvendig
- Sett miljøvariabelen `ANDROID_HOME` til Android SDK-mappa (typisk `%LOCALAPPDATA%\Android\Sdk` på Windows), og legg `%ANDROID_HOME%\platform-tools` til PATH

### Bygg og synk

Appen lastar sida live via `server.url` i staden for å pakke `dist/` inn i appen. Vanlege web-endringar treng difor **ikkje** ny native-bygg — dei blir tilgjengelege med det same via GitHub Pages-deployen. `npm run build` trengst framleis lokalt sidan Capacitor-CLI-en krev at `webDir` finst når han synkroniserer, sjølv om innhaldet ikkje blir brukt ved køyretid.

```bash
npm run build
npm run android:sync      # synkroniserer mot produksjon (res.hesteskokasting.no)
npx cap open android
```

For å teste mot dev-miljøet eller ein lokal Vite-dev-server i staden:

```bash
npm run android:sync:dev      # res.hesteskokasting.no/dev
npm run android:sync:local    # lokal Vite-server (npm run dev) via 10.0.2.2 — berre Android-emulator
```

`android:sync:local` peikar på `10.0.2.2`, Android-emulatorens alias for verts-maskina sin `localhost` — det fungerer ikkje på ei fysisk USB-tilkopla eining. For fysisk eining, bruk anten det automatiserte scriptet eller dei manuelle stega:

#### Automatisert (anbefalt)

```bash
npm run android:dev
```

Set opp heile flyten i eitt steg: startar Vite bunde til `127.0.0.1`, set opp `adb reverse tcp:5173 tcp:5173`, synkroniserer Capacitor mot `http://localhost:5173` og opnar Android Studio. Held seg køyrande og set opp `adb reverse` på nytt automatisk viss eininga koplar frå/til USB — vanlege kodeendringar treng då ingen ny sync/bygg, Vite HMR pushar dei direkte til WebView-en. Trykk Ctrl+C for å avslutte (stoppar Vite). Sjå [`scripts/android-dev.ps1`](scripts/android-dev.ps1).

#### Manuelt

```bash
npm run dev -- --host 127.0.0.1               # Vite bind seg elles berre til IPv6 (::1)
```

```powershell
adb reverse tcp:5173 tcp:5173                                       # gjer om i ny terminal ved kvar USB-tilkopling
$env:CAPACITOR_SERVER_URL = "http://localhost:5173"; npx cap sync android
```

`adb reverse` videresender til verts-maskina sin `127.0.0.1` (IPv4) — viss Vite berre lyttar på `[::1]` (standard ved reint `npm run dev`), får du ei tilkoplingsfeil sjølv om tunnelen er sett opp riktig. Tunnelen forsvinn når eininga koplar frå/til på nytt.

`CAPACITOR_SERVER_URL` fell alltid attende til produksjons-URL-en viss han ikkje er sett — dette hindrar at ein gløymd lokal override hamnar i eit Play Store-opplasta bygg. `npx cap open android` opnar Android Studio. Køyr frå ei tilkopla enhet (USB-debugging på) eller emulator med ▶ i verktøylinja.

Har WebView-en ikkje nettverkstilkopling ved oppstart, viser appen ein enkel innebygd feilskjerm (`android/app/src/main/assets/error.html`, handtert i `MainActivity.java`) i staden for ein blank eller øydelagd skjerm.

`android:sync:local`/`android:sync:dev`/manuell `http://`-override krev cleartext (vanleg HTTP), som Android blokkerer som standard frå `targetSdkVersion` 28+. `android/app/src/main/res/xml/network_security_config.xml` blokkerer cleartext for alle byggvariantar; `android/app/src/debug/res/xml/network_security_config.xml` overstyrer dette **berre for debug-bygget** og tillèt cleartext for `localhost`/`10.0.2.2`. Release-bygget (Play Store) får aldri cleartext, uansett `CAPACITOR_SERVER_URL`.

`android/` er committa til git (ikkje i `.gitignore`) sidan mappa inneheld manuell native-konfig (plugins, ikon, signeringsreferansar). **Rediger aldri** genererte filer i `android/app/src/main/assets/public/` direkte — dei blir overskrivne av `cap sync`.

### Google-innlogging i den native appen

Google blokkerer OAuth-innlogging inne i ein WebView (`disallowed_useragent`), så Google-innlogging i Android-appen brukar **ikkje** same nettlesar-omdirigering som nettsida. Han går i staden via Android sin native kontovel­jar (Credential Manager, via `@capgo/capacitor-social-login`) og `supabase.auth.signInWithIdToken()` — ingen WebView eller omdirigering involvert. Nettsida (vanlege nettlesarar) er heilt upåverka og brukar framleis den vanlege omdirigeringsflyten.

**Eingongsoppsett (Google Cloud Console + Supabase):**

1. Hent SHA-1-fingeravtrykk for begge nøkkellagera:
   ```bash
   cd android && ./gradlew signInReport
   ```
   (køyr éin gong for debug-nøkkelen, éin gong med release-`keystore.properties` på plass for release-nøkkelen)
2. I [Google Cloud Console](https://console.cloud.google.com/apis/credentials): lag éin **Web**-OAuth-klient-ID, og éin **Android**-OAuth-klient-ID (pakkenamn `no.hesteskokasting.app`) — registrer **begge** SHA-1-fingeravtrykka under den eine Android-klienten (treng ikkje to separate Android-klientar).
3. I Supabase Dashboard → Authentication → Providers → Google: legg inn Web-klient-ID-en og Android-klient-ID-en. La Client Secret og Callback URL stå tomme — denne ID-token-flyten brukar dei ikkje.
4. Legg Web-klient-ID-en inn som `VITE_GOOGLE_WEB_CLIENT_ID` i `.env.local` lokalt, og i GitHub Environments (`github-pages` og `dev`) — sjå [GitHub-konfigurasjon](#github-konfigurasjon). Appen lastar no same produksjonsbygg som nettsida, så variabelen må vere sett der bygget skjer, ikkje berre lokalt.

### Release-signering

`android/app/keystore.properties` og `android/app/keystore/hesteskokasting-release.keystore` er **med vilje ikkje i git** (sikkerheitsrisiko). Dei er sikkerheitskopiert separat: keystore-fila i privat Google Drive, passordet i passordhandterar.

Utan desse filene fell release-bygget automatisk tilbake til debug-signering (fint for lokal ytelsestesting, men **kan ikkje lastas opp til Google Play**). For å gjere eit ordentleg signert release-bygg på ei ny maskin:

1. Kopier `hesteskokasting-release.keystore` inn i `android/app/keystore/`
2. Lag `android/app/keystore.properties` med:
   ```
   storeFile=keystore/hesteskokasting-release.keystore
   storePassword=<passord frå passordhandterar>
   keyAlias=hesteskokasting
   keyPassword=<samme passord>
   ```

Sjå `plans/phase4-android-play-store.md` for status på Google Play-forberedelsar.

---

## iOS (Capacitor / TestFlight)

Appen er òg pakka med [Capacitor](https://capacitorjs.com) for iOS. iOS-bygget skjer **via GitHub Actions** fordi Xcode 26 er påkravd (Capacitor 8.4.x), men macOS 15 Sequoia støttar berre Xcode 16.

### Krav

- **Betalt Apple Developer-konto** ($99/år) — påkravd for TestFlight og App Store Connect
- Appen (`no.hesteskokasting.app`) oppretta i [App Store Connect](https://appstoreconnect.apple.com)
- App Store Connect API-nøkkel (sjå under)

### Sette opp signering (eingongsoppsett)

1. Logg inn på [App Store Connect](https://appstoreconnect.apple.com) → **Users and Access → Integrations → App Store Connect API**
2. Lag ein ny nøkkel med rolla **App Manager**. Last ned `.p8`-fila — du kan berre laste ho ned éin gong.
3. Finn desse tre verdiane:
   - **Key ID** — vist i tabellen etter at nøkkelen er oppretta
   - **Issuer ID** — øvst på same side
   - **Team ID** — øvst til høgre på [developer.apple.com](https://developer.apple.com)

4. Legg til eit nytt GitHub Environment kalla `testflight` under **Settings → Environments**, og legg inn desse secrets:

| Secret | Innhald |
|---|---|
| `APP_STORE_CONNECT_KEY_ID` | Key ID frå steg 3 |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID frå steg 3 |
| `APP_STORE_CONNECT_PRIVATE_KEY` | Innhald av `.p8`-fila (heile teksten, inkl. `-----BEGIN...`) |
| `APPLE_TEAM_ID` | Team ID frå steg 3 |

I tillegg treng `testflight`-miljøet dei same `VITE_*`-secrets som `github-pages`-miljøet — sjå [GitHub-konfigurasjon](#github-konfigurasjon).

### Køyre ein TestFlight-bygg

Workflowen triggar **ikkje** automatisk — han må startast manuelt:

1. Gå til **GitHub → Actions → iOS TestFlight**
2. Klikk **Run workflow**
3. Appen dukkar opp i TestFlight (etter Apple si prosessering, vanlegvis 5–15 min) klar til å distribuere til testarar

Byggnummeret aukar automatisk med kvart GitHub Actions-køyring (`github.run_number`), slik at Apple alltid får eit unikt bygg.

### Lokal iOS-utvikling

Lokal bygg mot ein simulator krev Xcode 26 + macOS 16. Inntil då er GitHub Actions einaste alternativet for å verifisere at appen bygger og køyrer.

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

android/                    # Nativt Android-prosjekt (Capacitor) — sjå eigen seksjon ovanfor
capacitor.config.ts         # Capacitor-konfig (app-id, webDir, server.url)
```
