# NHF Resultater

Nettapplikasjon for Norges Hesteskokastingsforbund. Viser resultat, terminliste, Norgescup, Norgesranking, rekorder og meir.

**Prod:** [res.hesteskokasting.no](https://res.hesteskokasting.no)
**Dev:** [res.hesteskokasting.no/dev](https://res.hesteskokasting.no/dev)

---

## Krav

- [Vite+](https://viteplus.dev) (`vp`) — verktøykjeda til prosjektet, og den einaste kommandoen du treng i det daglege
- [Node.js](https://nodejs.org/) v20 eller nyare — `vp` styrer Node-versjonen sjølv (`vp env install`), så du treng ikkje installere Node manuelt
- [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install) (Windows Subsystem for Linux) — påkravd av Docker Desktop
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — påkravd for lokal Supabase-stack og integrasjonstesting
- [GitHub CLI](https://cli.github.com/) (`gh`) — for å opprette issues og PR-ar frå terminalen, m.a. brukt av Claude Code til å registrere tech-debt-funn (sjå `CLAUDE.md`)

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

Start Docker Desktop og vent til det grøne ikonet i systembrettet viser at det køyrer. Slå så på WSL-integrasjonen: Docker Desktop → **Settings → Resources → WSL Integration** → slå på bryteren for distroen din (t.d. `Ubuntu`) → **Apply & Restart**.

**Sjekk at oppsettet stemmer** — i PowerShell:

```powershell
wsl -l -v        # lista over installerte distroar — VERSION-kolonnen skal vise 2, ikkje 1
wsl --status     # standard-distro og standard WSL-versjon
```

Inne i WSL-shellen (`wsl`):

```bash
cat /etc/os-release   # kva distro/versjon du faktisk køyrer (t.d. Ubuntu 22.04)
docker version         # stadfestar at Docker CLI-en i WSL når fram til Docker Desktop sin daemon
docker info            # meir detaljert — sjekk at "Server"-delen svarar, ikkje berre "Client"
docker context ls      # den aktive contexten (merka med *) skal vere desktop-linux
```

Viss `docker version`/`docker info` ikkje viser eit `Server`-svar, er ikkje WSL-integrasjonen slått på for distroen din — gå tilbake til Docker Desktop-innstillinga over.

**Viktig:** Den lokale Supabase-stacken (`vp exec supabase start`, `vp run test:db`) må køyrast **frå ein WSL-shell**, ikkje frå PowerShell/CMD. Supabase CLI-en oppdagar at køyringa skjer på Windows-verten og krev då at Docker-daemonen er eksponert på `tcp://localhost:2375` — noko som gjer at `analytics`- og `realtime`-containerane feilar helsesjekken (`unhealthy`) og stacken aldri startar. Køyrer CLI-en frå WSL i staden, går CLI-en den vanlege Linux-vegen mot Docker-daemonen, og problemet forsvinn heilt. Sjå steg-for-steg i [Integrasjonstesting (pgTAP)](#integrasjonstesting-pgtap).

### 2. Installer Vite+ (`vp`)

`vp` er eit globalt verktøy og ligg ikkje i prosjektet — det må installerast éin gong per maskin. I PowerShell:

```powershell
irm https://vite.plus/ps1 | iex
```

I ein WSL-/Linux-shell:

```bash
curl -fsSL https://vite.plus | bash
```

Opne ein ny terminal etterpå og stadfest med `vp help`. `vp env current` viser kva Node- og npm-versjon Vite+ løyser for prosjektet.

### 3. Klon og installer avhengigheiter

```bash
git clone https://github.com/hesteskokasting/resultater.git
cd resultater
vp install
```

Opprett `.env.local` i rota med Supabase-nøklar for **dev**-prosjektet:

```
VITE_SUPABASE_URL=https://<dev-prosjekt>.supabase.co
VITE_SUPABASE_ANON_KEY=<dev-anon-nøkkel>
```

Start dev-server:

```bash
vp run dev
```

Appen er tilgjengeleg på `http://localhost:5173`.

### 4. GitHub CLI

```bash
winget install --id GitHub.cli   # opne ein ny terminal etterpå (PATH vert oppdatert ved oppstart)
gh auth login                    # vel GitHub.com og innlogging via nettlesar
```

Stadfest med `gh auth status`. CLI-en vert brukt til issues og PR-ar frå terminalen — m.a. av Claude Code, som etter konvensjonen i `CLAUDE.md` kan registrere tech-debt-funn som GitHub-issues (alltid etter stadfesting).

---

## Kommandoar

Prosjektet brukar [Vite+](https://viteplus.dev) som verktøykjede, og `vp` er inngangen til alt — også pakkehandtering. Vite+ erstattar ikkje npm, men les kva pakkehandterar prosjektet brukar (`devEngines.packageManager` her), lastar ned rett versjon og køyrer npm under panseret. Difor treng du aldri skrive `npm` eller `npx` sjølv:

| I staden for            | Bruk                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm install`           | `vp install`                                                                                         |
| `npm install <pakke>`   | `vp add <pakke>` (`-D` for devDependencies)                                                          |
| `npm run <skript>`      | `vp run <skript>`                                                                                    |
| `npx <cli>`             | `vp exec <cli>` — CLI som ligg i `node_modules`                                                      |
| `npx <pakke>`           | `vp dlx <pakke>` — eingongskøyring av ein pakke som ikkje er installert (t.d. `vp dlx fallow dupes`) |
| `npm uninstall <pakke>` | `vp remove <pakke>`                                                                                  |

Vite+ legg eigne shims for `node`, `npm` og `npx` i `~/.vite-plus/bin`, og desse plukkar den Node- og npm-versjonen prosjektet krev. Får du `npm warn EBADDEVENGINES`-åtvaringar — som ser ut som feil, men ikkje har noko å gjere med kommandoen du køyrde — tyder det på at ein systeminstallert `npm` vinn over shimen i `PATH`. Sjekk med `vp env current` (viser kva `node`/`npm` som faktisk vert brukt) og `vp env doctor`. Køyrer du alt gjennom `vp`, er problemet uansett borte.

| Kommando                | Når du brukar det                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `vp run dev`            | Under utvikling — startar lokal Vite-dev-server med hot reload                                          |
| `vp run build`          | For å sjekke at prod-bygget fungerer lokalt før du pushar                                               |
| `vp run preview`        | Køyrer det ferdige `dist/`-bygget lokalt, nyttig for å teste prod-åtferd                                |
| `vp run test`           | Køyrer Vitest i watch-modus — re-køyrer testar ved kvar filendring                                      |
| `vp run test:run`       | Eingongskøyring av alle testar — bruk dette før commit og i CI                                          |
| `vp run typecheck:test` | Typesjekkjer testfilene (Vitest brukar esbuild, ikkje tsc — dette er einaste typesjekkinga av `tests/`) |
| `vp run test:db`        | Køyrer pgTAP-integrasjonstestane mot lokal Supabase-stack (krev `vp exec supabase start` fyrst)         |

**Du treng ikkje køyre `build` eller `dev` før du pushar.** GitHub Actions byggjer automatisk når du pushar:

- Push til `dev` → GitHub Actions byggjer og deployer til `res.hesteskokasting.no/dev`
- Push til `main` → GitHub Actions byggjer, ventar på manuell godkjenning, deployer til `res.hesteskokasting.no`

`vp run build` lokalt er berre nyttig viss du vil stadfeste at koden kompilerer utan å pushe, eller feilsøke byggfeil.

---

## Testing

Prosjektet nyttar [Vitest](https://vitest.dev/) med [happy-dom](https://github.com/capricorn86/happy-dom) for einingstesting av rein logikk.

Testfiler ligg i `tests/` og importerer frå `@/`-aliaset. Testane dekker berre funksjonar utan Supabase-kall — logikk som er samanvevd med databasekall vert fyrst ekstrahert til ein rein funksjon, deretter testa.

Tre kommandoar skal køyrast og vere grøne før kvar commit:

```bash
vp run typecheck && vp run typecheck:test && vp run test:run
```

Konfigurasjon: `vite.config.js` (test-blokk) og `tsconfig.test.json`.

### Integrasjonstesting (pgTAP)

Integrasjonstestane verifiserer databaselaget: RLS-politikkar og `SECURITY DEFINER`-funksjonar. Testfilene ligg i `supabase/tests/` og køyrer mot ein lokal Supabase-stack.

**Krav:** WSL 2 og Docker Desktop må vere installert og køyrande (sjå [Oppsett på ny maskin](#oppsett-på-ny-maskin)), og kommandoane nedanfor må køyrast **frå ein WSL-shell** — ikkje PowerShell/CMD. Grunn: Supabase CLI-en krev at Docker-daemonen er TCP-eksponert når CLI-en oppdagar at køyringa skjer direkte på Windows, og utan det feilar `analytics`/`realtime`-containerane helsesjekken. Frå WSL går CLI-en Linux-vegen og treng ikkje denne omvegen.

#### Fyrste gong: sett opp prosjektet inni WSL

1. Opne ein WSL-shell (`wsl` i PowerShell/Windows Terminal, eller opne distroen din direkte). **Stadfest at du faktisk er inne i WSL** — promptet skal sjå ut som `bruker@maskin:~$` (eit vanleg Linux-prompt), ikkje `C:\...>`. Viss du opnar prosjektmappa via Windows Utforskar/VS Code og hamnar i eit `cmd.exe`/PowerShell-vindauge som berre viser stien via `\\wsl.localhost\...`, er du **ikkje** i WSL — kommandoar som `vp exec supabase start` feilar då med at `supabase` ikkje vert funnen, sidan `cmd.exe` ikkje støttar UNC-stiar som arbeidsmappe og hoppar attende til ei Windows-mappe. I VS Code: bruk `∨`-menyen ved sida av `+` i terminalpanelet og vel **Ubuntu (WSL)**-profilen.

2. Gå til det **same** prosjektet du allereie har på `D:\repos\resultater` — WSL ser Windows-diskane dine under `/mnt/`:
   ```bash
   cd /mnt/d/repos/resultater
   ```
   Bruk **ikkje** ein separat klone/kopi her. Du vil teste migrasjonar og RLS-endringar _før_ du committar dei, og ein separat kopi ville kravd at du committa + pusha + pulla berre for å køyre ein lokal test — det gir ingen meining under aktiv utvikling. `/mnt/d/...` er noko tregare enn WSL sitt eige filsystem for filtunge operasjonar, men det merkast lite for `supabase start`/`test db`, og du slepp all synkronisering.
3. Installer Vite+ og Node inni WSL — Windows-installasjonane er ikkje synlege her:
   ```bash
   curl -fsSL https://vite.plus | bash   # installerer vp
   vp env install                        # installerer Node-versjonen prosjektet krev
   vp env current                        # stadfestar kva node/npm som vert brukt
   ```
4. Installer avhengigheiter (hentar Linux-bygg av `supabase`-CLI-en m.m.):
   ```bash
   vp install
   ```
   **Merk:** `node_modules` inneheld plattform-spesifikke binærfiler (`supabase`-CLI-en, `esbuild`). Sidan du no køyrer `vp install` mot den same mappa som Windows-checkoutet, overskriv dette dei Windows-bygde versjonane. Skal du tilbake til `vp run dev`/`vp run build` frå PowerShell etterpå, må du berre køyre `vp install` derifrå på nytt fyrst — éin kommando, tar nokre sekund. Ein grei bytte-kostnad mot å slepp separat klone + synkronisering.

#### Kvar gong: køyr stacken og testane

```bash
vp exec supabase start   # startar lokal Postgres og køyrer alle migreringsfiler
vp run test:db      # køyrer alle pgTAP-testar i supabase/tests/
vp exec supabase stop    # stoppar lokal stack når du er ferdig
```

Køyr integrasjonstestane når du endrar migreringsfiler, RLS-politikkar eller `SECURITY DEFINER`-funksjonar. Dei er ikkje ein del av den raske pre-commit-sjekkanen (Vitest).

---

## Branchar og deployment

| Branch | Miljø      | URL                          |
| ------ | ---------- | ---------------------------- |
| `main` | Produksjon | `res.hesteskokasting.no`     |
| `dev`  | Dev        | `res.hesteskokasting.no/dev` |

Push til `main` triggar GitHub Actions-workflow som byggjer og deployer til GitHub Pages. **Produksjon krev manuell godkjenning** i GitHub → Environments → `github-pages`.

Etter ein godkjend deploy taggar workflowen automatisk commiten med `v` + `version` frå [`package.json`](package.json) (t.d. `v0.9.12`). Er versjonen alt tagga, hoppar steget over — så fleire prod-deployar på same versjon er trygt, men du får berre éin tagg per versjonsnummer. Vil du at kvar utgåve skal vere tagga, må du auke `version` i same commit som du merger til `main`. `git log --first-parent main` gir deg utgåvelista.

**Angrar du etter push til `main`?** Du har to val:

- **Før du har godkjent deployen:** Gå til GitHub → Actions → den køyrande workflowen → klikk **"Reject"** i godkjenningssteget. Ingenting vert publisert, og du kan rette opp med ein ny commit.
- **Etter godkjenning (feil allereie live):** Køyr `git revert HEAD` lokalt og push til `main`. Dette lagar ein ny commit som angrar endringane, og triggrar ein ny deploy med den forrige versjonen.

Push til `dev` deployer automatisk til dev-miljøet utan godkjenning.

---

## Supabase-migrering

Prosjektet brukar Supabase CLI for databasemigrering. Migreringsfiler ligg i `supabase/migrations/`.

### Koble til eit prosjekt

```bash
vp exec supabase login
vp exec supabase link --project-ref <PROJECT_REF>
```

Project ref finn du på [supabase.com](https://supabase.com) → prosjektet → Settings → General.

### Oppdater TypeScript-typar

Når du gjer endringar i databaseskjemaet, regenerer `src/types/database.types.ts`:

```bash
vp run types:gen          # frå det linka prosjektet
vp run types:gen:local    # frå den lokale dev-databasen
```

Skripta køyrer `vp exec supabase gen types typescript` og lagrar utdataen akkurat slik Supabase-CLI-en skriv den ut. Denne autogenererte fila er difor unnateken både `vp fmt` (`fmt.ignorePatterns`) og `vp lint` (`lint.ignorePatterns`) i `vite.config.js` — formatering gjev heile fila som endring i diffen ved neste regenerering.

**Ikkje omdiriger sjølv med `>`/`2>&1`:** ved feil ville `>` tømt den innsjekka fila, og Supabase MCP-pluginen kan injisere ein `<claude-code-hint>`-tag på slutten viss stderr vert omdirigert. Skriptet fangar stdout og skriv til fila berre når utdataen ser rett ut.

---

### Lag ein ny migrasjon

```bash
vp exec supabase migration new <namn_på_migrasjon>
```

Rediger den nye `.sql`-fila i `supabase/migrations/`, køyr deretter:

```bash
vp exec supabase db push
```

### Miljø

- **Dev:** koble til dev-prosjektet og køyr `vp exec supabase db push`
- **Prod:** same prosedyre, men koble til prod-prosjektet (bytt `--project-ref`)

---

## Supabase Edge Functions

Edge Functions ligg i `supabase/functions/` og deployerast separat frå database-migreringar. Krev at prosjektet er linka (`vp exec supabase link`, sjå [Koble til eit prosjekt](#koble-til-eit-prosjekt)).

### Deploy

```bash
vp exec supabase functions deploy <namn>
```

### Sjå deployerte funksjonar

```bash
vp exec supabase functions list
```

### Loggar

```bash
vp exec supabase functions logs <namn>
vp exec supabase functions logs <namn> --follow   # streamer nye loggar live — nyttig medan du testar
```

### Secrets

Secrets til Edge Functions (API-nøklar o.l.) er separate frå GitHub-secrets og frå `.env.local` — dei set du direkte på Supabase-prosjektet, og dei er berre tilgjengelege server-side (aldri i klientkoden):

```bash
vp exec supabase secrets set NØKKEL=verdi ANNAN_NØKKEL=verdi2
vp exec supabase secrets list
vp exec supabase secrets unset NØKKEL
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

Appen lastar sida live via `server.url` i staden for å pakke `dist/` inn i appen. Vanlege web-endringar treng difor **ikkje** ny native-bygg — dei blir tilgjengelege med det same via GitHub Pages-deployen. `vp run build` trengst framleis lokalt sidan Capacitor-CLI-en krev at `webDir` finst ved synkronisering, sjølv om innhaldet ikkje blir brukt ved køyretid.

```bash
vp run build
vp run android:sync      # synkroniserer mot produksjon (res.hesteskokasting.no)
vp exec cap open android
```

For å teste mot dev-miljøet eller ein lokal Vite-dev-server i staden:

```bash
vp run android:sync:dev      # res.hesteskokasting.no/dev
vp run android:sync:local    # lokal Vite-server (vp run dev) via 10.0.2.2 — berre Android-emulator
```

`android:sync:local` peikar på `10.0.2.2`, Android-emulatorens alias for verts-maskina sin `localhost` — det fungerer ikkje på ei fysisk USB-tilkopla eining. For fysisk eining, bruk anten det automatiserte scriptet eller dei manuelle stega:

#### Automatisert (anbefalt)

```bash
vp run android:dev
```

Set opp heile flyten i eitt steg: startar Vite bunde til `127.0.0.1`, set opp `adb reverse tcp:5173 tcp:5173`, synkroniserer Capacitor mot `http://localhost:5173` og opnar Android Studio. Held seg køyrande og set opp `adb reverse` på nytt automatisk viss eininga koplar frå/til USB — vanlege kodeendringar treng då ingen ny sync/bygg, Vite HMR pushar dei direkte til WebView-en. Trykk Ctrl+C for å avslutte (stoppar Vite). Sjå [`scripts/android-dev.ps1`](scripts/android-dev.ps1).

#### Manuelt

```bash
vp run dev -- --host 127.0.0.1               # Vite bind seg elles berre til IPv6 (::1)
```

```powershell
adb reverse tcp:5173 tcp:5173                                       # gjer om i ny terminal ved kvar USB-tilkopling
$env:CAPACITOR_SERVER_URL = "http://localhost:5173"; vp exec cap sync android
```

`adb reverse` videresender til verts-maskina sin `127.0.0.1` (IPv4) — viss Vite berre lyttar på `[::1]` (standard ved reint `vp run dev`), får du ei tilkoplingsfeil sjølv om tunnelen er sett opp riktig. Tunnelen forsvinn når eininga koplar frå/til på nytt.

`CAPACITOR_SERVER_URL` fell alltid attende til produksjons-URL-en viss variabelen ikkje er sett — dette hindrar at ein gløymd lokal override hamnar i eit Play Store-opplasta bygg. `vp exec cap open android` opnar Android Studio. Køyr frå ei tilkopla enhet (USB-debugging på) eller emulator med ▶ i verktøylinja.

Har WebView-en ikkje nettverkstilkopling ved oppstart, viser appen ein enkel innebygd feilskjerm (`android/app/src/main/assets/error.html`, handtert i `MainActivity.java`) i staden for ein blank eller øydelagd skjerm.

`android:sync:local`/`android:sync:dev`/manuell `http://`-override krev cleartext (vanleg HTTP), som Android blokkerer som standard frå `targetSdkVersion` 28+. `android/app/src/main/res/xml/network_security_config.xml` blokkerer cleartext for alle byggvariantar; `android/app/src/debug/res/xml/network_security_config.xml` overstyrer dette **berre for debug-bygget** og tillèt cleartext for `localhost`/`10.0.2.2`. Release-bygget (Play Store) får aldri cleartext, uansett `CAPACITOR_SERVER_URL`.

`android/` er committa til git (ikkje i `.gitignore`) sidan mappa inneheld manuell native-konfig (plugins, ikon, signeringsreferansar). **Rediger aldri** genererte filer i `android/app/src/main/assets/public/` direkte — dei blir overskrivne av `cap sync`.

### Google-innlogging i den native appen

Google blokkerer OAuth-innlogging inne i ein WebView (`disallowed_useragent`), så Google-innlogging i Android-appen brukar **ikkje** same nettlesar-omdirigering som nettsida. Han går i staden via Android sin native kontovel­jar (Credential Manager, via `@capgo/capacitor-social-login`) og `supabase.auth.signInWithIdToken()` — ingen WebView eller omdirigering involvert. Nettsida (vanlege nettlesarar) er heilt upåverka og brukar framleis den vanlege omdirigeringsflyten.

**Eingongsoppsett (Google Cloud Console + Supabase):**

1. Hent SHA-1-fingeravtrykk for dei lokale nøkkellagera:
   ```bash
   cd android && ./gradlew signInReport
   ```
   (køyr éin gong for debug-nøkkelen, éin gong med release-`keystore.properties` på plass for opplastingsnøkkelen)
2. Hent SHA-1 for **appsigneringsnøkkelen** i Play Console → appen → **Test og publiser → Appintegritet → Appsignering**, under «Sertifikat for appsigneringsnøkkel».

   Dette er det lettaste å gå i baret på: Google re-signerer alle Play-utgåver med sin eigen nøkkel (Play App Signing), så ein app installert frå Play er **ikkje** signert med nøkkelen din. Registrerer du berre debug- og opplastingsnøkkelen, verkar Google-innlogging lokalt og i eit sideloada release-bygg, men feilar med `DEVELOPER_ERROR` (status 10) for alle som har appen frå Play. Fingeravtrykket er offentleg — per august 2026 er det `52:F2:AE:5C:CA:4A:F3:12:6F:51:C6:50:EE:A4:70:D7:54:6A:F6:C7`.

3. I [Google Cloud Console](https://console.cloud.google.com/apis/credentials): lag éin **Web**-OAuth-klient-ID, og éin **Android**-OAuth-klient-ID (pakkenamn `no.hesteskokasting.app`) — registrer **alle tre** SHA-1-fingeravtrykka (debug, opplasting, appsignering) under den eine Android-klienten (treng ikkje separate klientar).
4. I Supabase Dashboard → Authentication → Providers → Google: legg inn Web-klient-ID-en og Android-klient-ID-en. La Client Secret og Callback URL stå tomme — denne ID-token-flyten brukar dei ikkje.
5. Legg Web-klient-ID-en inn som `VITE_GOOGLE_WEB_CLIENT_ID` i `.env.local` lokalt, og i GitHub Environments (`github-pages` og `dev`) — sjå [GitHub-konfigurasjon](#github-konfigurasjon). Appen lastar no same produksjonsbygg som nettsida, så variabelen må vere sett der bygget skjer, ikkje berre lokalt.

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
2. Lag ein ny nøkkel med rolla **App Manager**. Last ned `.p8`-fila — nedlasting er berre mogleg éin gong.
3. Finn desse tre verdiane:
   - **Key ID** — vist i tabellen etter at nøkkelen er oppretta
   - **Issuer ID** — øvst på same side
   - **Team ID** — øvst til høgre på [developer.apple.com](https://developer.apple.com)

4. Legg til eit nytt GitHub Environment kalla `testflight` under **Settings → Environments**, og legg inn desse secrets:

| Secret                          | Innhald                                                      |
| ------------------------------- | ------------------------------------------------------------ |
| `APP_STORE_CONNECT_KEY_ID`      | Key ID frå steg 3                                            |
| `APP_STORE_CONNECT_ISSUER_ID`   | Issuer ID frå steg 3                                         |
| `APP_STORE_CONNECT_PRIVATE_KEY` | Innhald av `.p8`-fila (heile teksten, inkl. `-----BEGIN...`) |
| `APPLE_TEAM_ID`                 | Team ID frå steg 3                                           |

I tillegg treng `testflight`-miljøet dei same `VITE_*`-secrets som `github-pages`-miljøet — sjå [GitHub-konfigurasjon](#github-konfigurasjon).

### Køyre ein TestFlight-bygg

Workflowen triggar **ikkje** automatisk — workflowen må startast manuelt:

1. Gå til **GitHub → Actions → iOS TestFlight**
2. Klikk **Run workflow**
3. Appen dukkar opp i TestFlight (etter Apple si prosessering, vanlegvis 5–15 min) klar til å distribuere til testarar

Byggnummeret aukar automatisk med kvart GitHub Actions-køyring (`github.run_number`), slik at Apple alltid får eit unikt bygg.

### Lokal iOS-utvikling

Lokal bygg mot ein simulator krev Xcode 26 + macOS 16. Inntil då er GitHub Actions einaste alternativet for å verifisere at appen bygger og køyrer.

---

## Gi ut ein ny app-versjon (Google Play + TestFlight)

Appane lastar nettsida live via `server.url`, så **vanlege web-endringar treng ikkje ny app-versjon** — dei er ute med det same GitHub Pages-deployen er godkjend. Nytt native-bygg trengst berre når noko native har endra seg: ein ny Capacitor-plugin, endra `capacitor.config.ts`, ikon/splash, `AndroidManifest.xml`, Gradle-konfigurasjon eller liknande.

### 1. Deploy web fyrst

Merge `dev` → `main` og godkjenn produksjonsdeployen (sjå [Branchar og deployment](#branchar-og-deployment)).

Dette må skje fyrst fordi JS-koden som brukar ein ny plugin ligg i web-bygget, ikkje i appen. Motsett rekkjefølgje er ufarleg — gamle installasjonar loggar berre ein `not implemented`-feil som blir fanga opp — men då gjer den nye appversjonen ingenting før weben er ute.

### 2. Auk byggnummeret

`versionCode` for Android kjem frå `buildNumber` i `package.json` ([`android/app/build.gradle`](android/app/build.gradle)). Google Play avviser eit opplasta bygg med eit `versionCode` som allereie finst, så auk det med éin og commit:

```jsonc
"buildNumber": 4
```

`versionName` kjem frå `version` i same fil — auk den òg viss dette er ein versjon brukarane skal sjå. iOS treng ingenting: byggnummeret der kjem automatisk frå `github.run_number`.

### 3. Byggj Android-AAB-en

```powershell
Set-Location <repo>
vp run build
vp run android:sync          # MERK: utan CAPACITOR_SERVER_URL — sjå åtvaringa under
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
Set-Location android
.\gradlew.bat bundleRelease
```

AAB-en hamnar i `android/app/build/outputs/bundle/release/app-release.aab`.

> **Åtvaring:** har du testa mot dev eller ein lokal Vite-server, peikar `android/app/src/main/assets/capacitor.config.json` framleis dit. `vp run android:sync` utan `CAPACITOR_SERVER_URL` skriv han tilbake til produksjon — hopp aldri over dette steget. (Release-bygget blokkerer uansett cleartext, så eit gløymt `http://localhost`-bygg feilar synleg i staden for stille, men versjonen er då brend.)

Du treng **ikkje** opne Android Studio. Ligg `android/app/keystore.properties` på plass, signerer Gradle release-bygget med release-nøkkelen automatisk — sjå [Release-signering](#release-signering). Manglar fila, fell bygget tilbake til debug-signering og Play avviser opplastinga.

Sjekk til slutt at bygget er signert med release-nøkkelen og ikkje debug-nøkkelen. Ein AAB er jar-signert, så `keytool` les han direkte (`aapt2 dump badging` fungerer berre på APK-ar):

```powershell
& "$env:JAVA_HOME\bin\keytool.exe" -printcert -jarfile android\app\build\outputs\bundle\release\app-release.aab
```

Står det `CN=Android Debug` i utskrifta, mangla `keystore.properties` under bygget.

Sidan éin einaste plugin-klasse som manglar stoppar registreringa av **alle** plugins ved oppstart, er det verdt å stadfeste at kvar `classpath` i `android/app/src/main/assets/capacitor.plugins.json` faktisk finst i bygget før du lastar opp.

### 4. Last opp til Google Play

[Play Console](https://play.google.com/console) → appen → **Testing → Internal testing** (eller **Production**) → **Create new release** → last opp `app-release.aab`.

### 5. Send til TestFlight

**GitHub → Actions → iOS TestFlight → Run workflow**, køyrd mot `main` etter mergen i steg 1. Workflowen byggjer weben, synkroniserer Capacitor og lastar opp sjølv — sjå [Køyre ein TestFlight-bygg](#køyre-ein-testflight-bygg).

---

## Prosjektstruktur

```
src/
├── app.ts                  # SPA-ruter
├── supabase.ts             # Supabase-klient
├── admin/                  # Admin-sider (kaster, klubb, stevne)
│   ├── admin.ts            # Admin-skalet: fanene under #/admin/<fane>
│   ├── _adminUi.ts         # Delte DOM-byggjarar (rader, nøkkeltal, snarvegar)
│   ├── _adminCharts.ts     # Chart.js-innpakking; les fargane frå --chart-*
│   ├── _adminModal.ts      # Overlegget for opprett/rediger på dashbordet
│   ├── _adminEdit.ts       # Opnar rett skjema i overlegget og oppdaterer panelet
│   ├── forms/              # Skjema delt mellom eiga rute og overlegget
│   └── panels/             # Ei fil per fane (oversikt, stevne, utøvarar, …)
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
