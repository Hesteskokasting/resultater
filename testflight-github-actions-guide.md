# TestFlight via GitHub Actions (xcodebuild cloud signing)

Guide for å bygge og distribuere Hesteskokasting-appen (`no.hesteskokasting.app`) til TestFlight uten fysisk Mac, ved bruk av GitHub Actions macOS-runner.

**Tilnærming:** Ren `xcodebuild` med *cloud signing* (`-allowProvisioningUpdates` + App Store Connect API-nøkkel). Apple oppretter og vedlikeholder sertifikater og provisioning profiles automatisk i skyen. Ingen Fastlane, ingen Match, ingen eget certs-repo, ingen Ruby — færre bevegelige deler og færre secrets.

**Forutsetning:** Apple Developer-tilgang er godkjent av styret. Capacitor iOS-plattformen (`ios/`) er allerede lagt til og committet (bruker Swift Package Manager, ikke CocoaPods).

---

## Oversikt over stegene

1. App Store Connect – opprett app-oppføring
2. App Store Connect API-nøkkel
3. GitHub Secrets
4. Kjør og verifiser
5. Legg til testere
6. Feilsøking / vanlige problemer

---

## Steg 1: App Store Connect – opprett app-oppføring

1. Logg inn på [appstoreconnect.apple.com](https://appstoreconnect.apple.com) med organisasjonskontoen (den som styret godkjente).
2. Gå til **Certificates, Identifiers & Profiles → Identifiers → +**.
   - Velg **App IDs → App**.
   - Bundle ID: velg **Explicit**, skriv `no.hesteskokasting.app`.
   - Beskrivelse: f.eks. "Hesteskokasting App".
   - Huk av capabilities appen faktisk bruker (f.eks. Push Notifications hvis/når OneSignal tas i bruk på iOS).
   - Registrer.
3. Gå til **My Apps → + → New App**:
   - Platform: iOS
   - Name: Hesteskokasting
   - Primary language: Norwegian (eller English hvis Norwegian ikke er tilgjengelig som primærspråk)
   - Bundle ID: velg `no.hesteskokasting.app` fra listen (den du nettopp registrerte)
   - SKU: en unik streng bare du ser, f.eks. `hesteskokasting-ios-001`
   - User Access: Full Access
4. Lagre. Du trenger ikke fylle ut resten av metadata (skjermbilder, beskrivelse osv.) for å få TestFlight til å fungere — det er bare nødvendig for faktisk App Store-lansering.

Noter også **Team ID**: finnes på [developer.apple.com/account](https://developer.apple.com/account) under **Membership details** (10 tegn, f.eks. `AB12CD34EF`).

---

## Steg 2: App Store Connect API-nøkkel

Dette er nøkkelen CI-systemet bruker for å signere og laste opp builds *uten* at du logger inn med Apple ID og 2FA hver gang. Med cloud signing brukes den også til å opprette sertifikat og provisioning profile automatisk.

1. **Users and Access → Integrations (fanen i toppen) → App Store Connect API**.
2. Klikk **Generate API Key** (eller "+").
3. Navn: f.eks. "GitHub Actions CI".
4. Access: **App Manager**. *(Hvis første build feiler med en rettighetsfeil ved oppretting av distribusjonssertifikat, oppgrader nøkkelen til **Admin** — cloud signing trenger det i noen tilfeller første gang.)*
5. Klikk **Generate**.
6. **Last ned `.p8`-filen umiddelbart** — Apple lar deg kun laste den ned ÉN gang. Lagre den trygt lokalt (passordmanager e.l., IKKE i git-repoet).
7. Noter ned:
   - **Key ID** (kort, f.eks. `ABC123XYZ9`)
   - **Issuer ID** (lengre UUID, vises på toppen av API-siden, delt for alle nøkler)

---

## Steg 3: GitHub Secrets

Workflowen (`.github/workflows/ios-testflight.yml`) bruker `environment: testflight`. Opprett først miljøet: **Settings → Environments → New environment** → navn `testflight`. Legg deretter secrets inn *i miljøet* (Environment secrets), ikke som vanlige repository secrets — med mindre de allerede finnes som repository secrets (de fire `VITE_*`-verdiene brukes også av deploy-workflowene).

| Secret navn | Verdi |
|---|---|
| `APP_STORE_CONNECT_KEY_ID` | Key ID fra steg 2 |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID fra steg 2 |
| `APP_STORE_CONNECT_PRIVATE_KEY` | **Rå tekstinnhold** av `.p8`-filen (åpne i editor, kopier alt inkl. `-----BEGIN PRIVATE KEY-----`/`-----END PRIVATE KEY-----`). *Ikke* base64. |
| `APPLE_TEAM_ID` | Team ID fra steg 1 |
| `VITE_SUPABASE_URL` | Samme som i deploy-workflowene |
| `VITE_SUPABASE_ANON_KEY` | Samme som i deploy-workflowene |
| `VITE_GOOGLE_WEB_CLIENT_ID` | Samme som i deploy-workflowene |
| `VITE_ONESIGNAL_APP_ID` | Samme som i deploy-workflowene |

---

## Steg 4: Kjør og verifiser

1. Gå til **Actions**-fanen → **iOS TestFlight** → **Run workflow**.
2. Følg med på loggen. En full build tar typisk 10–20 minutter.
3. Første kjøring oppretter Apple automatisk et distribusjonssertifikat (cloud-managed) og en provisioning profile — du skal ikke gjøre noe manuelt.
4. Ved suksess: gå til App Store Connect → din app → **TestFlight**-fanen. Builden dukker opp der etter noen minutters prosessering fra Apple sin side ("Processing" → "Ready to Test").

Byggenummeret settes automatisk til GitHub run number (`CURRENT_PROJECT_VERSION=${{ github.run_number }}`), så hver kjøring får et høyere nummer — TestFlight krever stigende byggenumre.

---

## Steg 5: Legg til testere

- **Internal Testing**: Under TestFlight-fanen → **Internal Testing** → legg til styremedlemmer (de må være lagt til som brukere under **Users and Access** i App Store Connect med minst "Developer"-rolle). Ingen Apple-review nødvendig — tilgjengelig nesten umiddelbart.
- **External Testing**: Krever at Apple godkjenner en "beta app review" første gang (vanligvis under 24t). Bruk denne gruppen hvis dere vil ha testere utenfor styret, opptil 10 000 personer via delbar lenke.

---

## Steg 6: Feilsøking / vanlige problemer

- **"Signing for 'App' requires a development team"**: `APPLE_TEAM_ID`-secreten mangler eller er feil — workflowen sender den inn som `DEVELOPMENT_TEAM` til xcodebuild.
- **Rettighetsfeil ved oppretting av sertifikat/profil** (f.eks. "You are not allowed to perform this operation"): API-nøkkelen har for lav tilgang. Oppgrader til **Admin** i App Store Connect (steg 2).
- **"Invalid API key" / autentiseringsfeil**: Sjekk at `APP_STORE_CONNECT_PRIVATE_KEY` er hele den rå `.p8`-teksten (med BEGIN/END-linjene), og at Key ID og Issuer ID stemmer.
- **Bundle ID ikke funnet**: App ID-en må være registrert i App Store Connect (steg 1) før første build.
- **Secrets er tomme i loggen**: Secrets ligger som repository secrets, men workflowen bruker `environment: testflight` — flytt dem inn i miljøet, eller sjekk at miljønavnet stemmer.
- **Provisioning profile / sertifikat utløpt**: Ingenting å gjøre manuelt — `-allowProvisioningUpdates` fornyer automatisk ved neste kjøring.
- **Vil bytte til Codemagic senere**: Samme `.p8`, Key ID og Issuer ID kan limes rett inn i Codemagic sitt UI. Ingen signering å migrere — Apple eier sertifikatene i skyen.

---

## Hvorfor ikke Fastlane Match?

Match lagrer sertifikater kryptert i et eget git-repo og er nyttig når flere utviklere med egne Mac-er skal dele signeringsmateriale. Her er CI den eneste som signerer, og cloud signing gjør samme jobb uten eget certs-repo, PAT, `MATCH_PASSWORD`, Ruby/Fastlane-vedlikehold eller årlig token-fornyelse. Skulle behovet oppstå senere (lokal Mac-utvikling i teamet), kan Match legges til da — API-nøkkelen fra steg 2 gjenbrukes.
