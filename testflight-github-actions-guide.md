# TestFlight via GitHub Actions + Fastlane Match

Guide for å bygge og distribuere Hesteskokasting-appen (`no.hesteskokasting.app`) til TestFlight uten fysisk Mac, ved bruk av GitHub Actions macOS-runner og Fastlane Match for kodesignering.

**Forutsetning:** Apple Developer-tilgang er allerede godkjent av styret. Capacitor-integrasjonen er på plass i prosjektet.

---

## Oversikt over stegene

1. App Store Connect – opprett app-oppføring
2. App Store Connect API-nøkkel
3. Privat GitHub-repo for sertifikater (match storage)
4. Personal Access Token (PAT) for match
5. Legg til iOS-plattform i prosjektet (`cap add ios`)
6. Fastlane-konfigurasjon
7. GitHub Secrets
8. Bootstrap-workflow (kjøres én gang)
9. Hoved-CI/CD workflow for TestFlight
10. Kjør og verifiser
11. Legg til testere
12. Feilsøking / vanlige problemer

---

## Steg 1: App Store Connect – opprett app-oppføring

1. Logg inn på [appstoreconnect.apple.com](https://appstoreconnect.apple.com) med organisasjonskontoen (den som styret godkjente).
2. Gå til **Certificates, Identifiers & Profiles → Identifiers → +**.
   - Velg **App IDs → App**.
   - Bundle ID: velg **Explicit**, skriv `no.hesteskokasting.app`.
   - Beskrivelse: f.eks. "Hesteskokasting App".
   - Huk av capabilities appen faktisk bruker (f.eks. Push Notifications siden du bruker OneSignal/Firebase).
   - Registrer.
3. Gå til **My Apps → + → New App**:
   - Platform: iOS
   - Name: Hesteskokasting
   - Primary language: Norwegian (eller English hvis Norwegian ikke er tilgjengelig som primærspråk)
   - Bundle ID: velg `no.hesteskokasting.app` fra listen (den du nettopp registrerte)
   - SKU: en unik streng bare du ser, f.eks. `hesteskokasting-ios-001`
   - User Access: Full Access
4. Lagre. Du trenger ikke fylle ut resten av metadata (skjermbilder, beskrivelse osv.) for å få TestFlight til å fungere — det er bare nødvendig for faktisk App Store-lansering.

---

## Steg 2: App Store Connect API-nøkkel

Dette er en nøkkel CI-systemet bruker for å signere og laste opp builds *uten* at du logger inn med Apple ID og 2FA hver gang.

1. **Users and Access → Integrations (fanen i toppen) → App Store Connect API**.
2. Klikk **Generate API Key** (eller "+").
3. Navn: f.eks. "GitHub Actions CI".
4. Access: **App Manager** (nok rettigheter til å bygge og laste opp; Admin fungerer også).
5. Klikk **Generate**.
6. **Last ned `.p8`-filen umiddelbart** — Apple lar deg kun laste den ned ÉN gang. Lagre den et trygt sted lokalt (f.eks. i en passordbeskyttet mappe, IKKE i git-repoet).
7. Noter ned, du får bruk for begge:
   - **Key ID** (kort, f.eks. `ABC123XYZ9`)
   - **Issuer ID** (lengre UUID, vises på toppen av API-siden, delt for alle nøkler)

---

## Steg 3: Privat GitHub-repo for sertifikater (match storage)

Fastlane Match lagrer sertifikater og provisioning profiles kryptert i et eget git-repo. Dette skiller signeringsmateriale fra selve kildekoden.

1. Gå til [github.com/new](https://github.com/new).
2. Repository name: f.eks. `hesteskokasting-certs`.
3. **Visibility: Private** (viktig — dette skal ikke være offentlig).
4. Ikke legg til README, .gitignore eller lisens — la det være helt tomt.
5. Klikk **Create repository**.

Match vil selv fylle dette repoet med krypterte filer første gang du kjører bootstrap (steg 8).

---

## Steg 4: Personal Access Token (PAT) for match

CI-jobben trenger et token med skriverettigheter til `hesteskokasting-certs`-repoet, siden den vanlige `GITHUB_TOKEN` som Actions får automatisk kun har tilgang til repoet workflowen kjører i.

### Opprette et fine-grained PAT (anbefalt, mer begrenset og tryggere enn classic token):

1. Gå til GitHub → klikk profilbildet ditt (øverst til høyre) → **Settings**.
2. Scroll helt ned i venstremenyen til **Developer settings**.
3. Velg **Personal access tokens → Fine-grained tokens**.
4. Klikk **Generate new token**.
5. Fyll ut:
   - **Token name**: f.eks. `fastlane-match-certs`
   - **Expiration**: sett en dato (f.eks. 1 år). Merk deg denne — du må lage en ny når den utløper.
   - **Resource owner**: velg organisasjonen/kontoen som eier `hesteskokasting-certs`-repoet.
   - **Repository access**: velg **Only select repositories** → huk av `hesteskokasting-certs`.
6. Under **Permissions → Repository permissions**:
   - Sett **Contents: Read and write** (dette er det match faktisk trenger for å pushe krypterte filer).
7. Klikk **Generate token**.
8. **Kopier token-verdien umiddelbart** — den vises kun én gang og starter med `github_pat_...`. Lim den inn et trygt sted (eller direkte inn i GitHub Secrets i steg 7, så slipper du å lagre den andre steder).

> **Hvis organisasjonen krever godkjenning av fine-grained tokens** (vanlig for GitHub-organisasjoner): en organisasjonseier (deg, siden du er IT-ansvarlig) må godkjenne tokenet under **Organization settings → Personal access tokens → Pending requests** før det virker.

---

## Steg 5: Legg til iOS-plattform i prosjektet

Dette gjøres lokalt på din Windows-maskin — krever ikke Mac, bare Node.js:

```bash
npx cap add ios
npx cap sync ios
```

Dette genererer en `ios/App/`-mappe med Xcode-prosjektfiler. Commit og push denne mappen til hovedrepoet:

```bash
git add ios/
git commit -m "Legg til iOS-plattform via Capacitor"
git push
```

---

## Steg 6: Fastlane-konfigurasjon

Disse filene er bare tekst — du kan lage/redigere dem i VS Code på Windows, ingen Mac nødvendig. Legg dem i `ios/App/`.

**`ios/App/Gemfile`:**
```ruby
source "https://rubygems.org"
gem "fastlane"
```

**`ios/App/fastlane/Appfile`:**
```ruby
app_identifier("no.hesteskokasting.app")
```

**`ios/App/fastlane/Matchfile`:**
```ruby
git_url("https://github.com/DITT_ORG/hesteskokasting-certs.git")
storage_mode("git")
type("appstore")
```
*(Bytt `DITT_ORG` med din faktiske GitHub-org/brukernavn.)*

**`ios/App/fastlane/Fastfile`:**
```ruby
default_platform(:ios)

platform :ios do
  before_all do
    app_store_connect_api_key(
      key_id: ENV["ASC_KEY_ID"],
      issuer_id: ENV["ASC_ISSUER_ID"],
      key_content: ENV["ASC_KEY_CONTENT"],
      is_key_content_base64: true
    )
  end

  desc "Bootstrap certs (kjøres én gang manuelt, eller når profiler må fornyes)"
  lane :bootstrap_certs do
    match(type: "appstore", readonly: false)
  end

  desc "Build og last opp til TestFlight"
  lane :beta do
    match(type: "appstore", readonly: true)
    build_app(
      workspace: "App.xcworkspace",
      scheme: "App",
      export_method: "app-store"
    )
    upload_to_testflight(skip_waiting_for_build_processing: true)
  end
end
```

Commit disse filene til hovedrepoet.

---

## Steg 7: GitHub Secrets

Legg secrets til i **hovedrepoet** (der `.github/workflows/` ligger): **Settings → Secrets and variables → Actions → New repository secret**.

| Secret navn | Verdi | Hvordan skaffe |
|---|---|---|
| `ASC_KEY_ID` | Key ID fra steg 2 | Direkte fra App Store Connect |
| `ASC_ISSUER_ID` | Issuer ID fra steg 2 | Direkte fra App Store Connect |
| `ASC_KEY_CONTENT` | `.p8`-filen, base64-encodet | Se under |
| `MATCH_PASSWORD` | Et selvvalgt sterkt passord | Du velger selv — dette krypterer sertifikatene i certs-repoet. Skriv det ned et trygt sted (passordmanager), du får bruk for det igjen hvis du må sette opp match fra scratch. |
| `MATCH_GIT_TOKEN` | PAT fra steg 4 | Kopiert i steg 4 |

### Base64-encode `.p8`-filen på Windows (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\til\AuthKey_ABC123XYZ9.p8")) | Set-Clipboard
```

Dette kopierer base64-strengen direkte til utklippstavlen — lim den rett inn som verdien for `ASC_KEY_CONTENT` i GitHub Secrets.

---

## Steg 8: Bootstrap-workflow (kjøres én gang)

Denne genererer selve sertifikatet og provisioning profile første gang, og lagrer dem kryptert i `hesteskokasting-certs`.

**`.github/workflows/ios-bootstrap.yml`:**
```yaml
name: iOS Bootstrap Certs
on: workflow_dispatch

jobs:
  bootstrap:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4

      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
          working-directory: ios/App

      - name: Bootstrap match
        working-directory: ios/App
        env:
          ASC_KEY_ID: ${{ secrets.ASC_KEY_ID }}
          ASC_ISSUER_ID: ${{ secrets.ASC_ISSUER_ID }}
          ASC_KEY_CONTENT: ${{ secrets.ASC_KEY_CONTENT }}
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          GIT_URL_TOKEN: ${{ secrets.MATCH_GIT_TOKEN }}
        run: bundle exec fastlane bootstrap_certs
```

Commit og push denne filen. Deretter:

1. Gå til **Actions**-fanen i hovedrepoet på GitHub.
2. Velg **iOS Bootstrap Certs** i venstremenyen.
3. Klikk **Run workflow** (den grå knappen til høyre) → **Run workflow**.
4. Vent til den er ferdig (grønn hake). Sjekk at `hesteskokasting-certs`-repoet nå har fått innhold (krypterte filer) — det bekrefter at det virket.

Du trenger normalt kun kjøre denne én gang, med mindre sertifikatet utløper (gyldig 1 år) eller du må revoke/regenerere.

---

## Steg 9: Hoved-CI/CD workflow for TestFlight

**`.github/workflows/ios-testflight.yml`:**
```yaml
name: iOS TestFlight
on:
  workflow_dispatch:
  push:
    branches: [release]

jobs:
  build:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npm run build
      - run: npx cap sync ios

      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
          working-directory: ios/App

      - name: Pod install
        working-directory: ios/App
        run: pod install

      - name: Build & upload to TestFlight
        working-directory: ios/App
        env:
          ASC_KEY_ID: ${{ secrets.ASC_KEY_ID }}
          ASC_ISSUER_ID: ${{ secrets.ASC_ISSUER_ID }}
          ASC_KEY_CONTENT: ${{ secrets.ASC_KEY_CONTENT }}
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          GIT_URL_TOKEN: ${{ secrets.MATCH_GIT_TOKEN }}
        run: bundle exec fastlane beta
```

> **Merk:** Siden appen bruker `server.url` mot GitHub Pages (native shell peker til hostet web-innhold ved runtime, ikke bundlet), er `npm run build`/`cap sync`-stegene sannsynligvis ikke strengt nødvendige for web-assets. De er inkludert her for å være trygg (i tilfelle noe caches lokalt i native-prosjektet), men du kan fjerne dem hvis du bekrefter at native-shell aldri leser lokale web-assets.

Commit og push denne filen.

---

## Steg 10: Kjør og verifiser

1. Gå til **Actions**-fanen → **iOS TestFlight** → **Run workflow**.
2. Følg med på loggen. En full build tar typisk 10–20 minutter.
3. Ved suksess: gå til App Store Connect → din app → **TestFlight**-fanen. Builden dukker opp der etter noen minutters prosessering fra Apple sin side ("Processing" → "Ready to Submit"/"Ready to Test").

---

## Steg 11: Legg til testere

- **Internal Testing**: Under TestFlight-fanen → **Internal Testing** → legg til styremedlemmer (de må være lagt til som brukere under **Users and Access** i App Store Connect med minst "Developer"-rolle). Ingen Apple-review nødvendig — tilgjengelig nesten umiddelbart.
- **External Testing**: Krever at Apple godkjenner en "beta app review" første gang (vanligvis under 24t). Bruk denne gruppen hvis dere vil ha testere utenfor styret, opptil 10 000 personer via delbar lenke.

---

## Steg 12: Feilsøking / vanlige problemer

- **"No profiles found" i build-steget**: Bootstrap (steg 8) har ikke kjørt, eller `MATCH_PASSWORD` stemmer ikke overens mellom bootstrap og beta-lane.
- **Match kan ikke pushe til certs-repoet**: PAT har utløpt, mangler godkjenning fra org-eier, eller har feil rettigheter (skal være Contents: Read and write).
- **"Invalid API key" fra App Store Connect**: Sjekk at `ASC_KEY_CONTENT` faktisk er base64 av hele `.p8`-filen (ikke bare limt inn rå tekst), og at `is_key_content_base64: true` står i Fastfile.
- **Build feiler på `pod install`**: Sjekk at `Podfile` faktisk ble generert av `cap sync ios` — kjør `npx cap sync ios` lokalt og commit endringer hvis noe mangler.
- **Provisioning profile utløpt**: Kjør bootstrap-workflowen på nytt (steg 8) — match fornyer automatisk.
- **Vil bytte til Codemagic senere**: Signeringsoppsettet med App Store Connect API-nøkkel er gjenbrukbart — samme `.p8`, Key ID og Issuer ID kan limes rett inn i Codemagic sitt UI uten å måtte sette opp match på nytt.
