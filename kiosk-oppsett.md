# Kiosk-oppsett: Intune-konfigurert innlogging

Ein tablet som er meldt inn i Intune kan logge seg inn i appen på eiga hand. Intune
sender berre ein **einingsnøkkel** — aldri eit passord. Appen byter nøkkelen mot ein
sesjon på klubbkontoen eininga høyrer til, gjennom edge-funksjonen `device-login`.

Ei eining blir stengd ute ved å setje `active = false` på rada si. Ingen passordbyte,
og ingen andre einingar blir råka.

---

## 1. Føresetnader

Alt dette må vere på plass før Intune-policyen gjer nytte:

| Steg | Kommando / stad                                                                      |
| ---- | ------------------------------------------------------------------------------------ |
| 1    | `vp exec supabase db push` — opprettar tabellen `kiosk_device`                       |
| 2    | `vp exec supabase functions deploy device-login`                                     |
| 3    | Ny app-build ute i managed Google Play (`cap sync android` + ny AAB)                 |
| 4    | Klubbkonto i Supabase Auth, med `rolle = 'klubbadmin'` og rad i `klubbadmin_klubber` |

**Steg 3 er ikkje valfritt.** Plugin-en som les konfigurasjonen er native kode. Ein
tablet med ein eldre app-versjon les ingenting, uansett kor riktig policyen er.

---

## 2. Vel kor finkorna nøklane skal vere

Nøkkelen peikar på ein klubbkonto. Kor mange nøklar du lagar er ei avveging:

- **Éin nøkkel per eining** — ein tapt tablet blir kutta åleine, og `last_login_at`
  viser kva for ei eining som faktisk er i bruk. Krev éi Intune-gruppe og éin
  konfigurasjonspolicy per eining.
- **Éin nøkkel per klubb** — éin policy for heile klubben. Ein tapt tablet betyr at
  alle einingane i klubben må få ny nøkkel.

Start med éin per klubb dersom klubben har éin eller to tablets. Gå over til éin per
eining når det blir fleire, eller når ein tablet er utanfor kontroll mellom stevna.

---

## 3. Lag nøkkelen og registrer eininga

Nøkkelen er ein UUID. Berre sha256-summen blir lagra, så **ta vare på nøkkelen når du
lagar han** — han kan ikkje lesast ut igjen seinare.

```sql
-- 1. Generer nøkkelen, og kopier han til utklippstavla
SELECT gen_random_uuid();

-- 2. Registrer eininga (byt ut <key> og e-posten)
INSERT INTO public.kiosk_device (name, key_hash, user_id)
VALUES ('Skjold court A',
        encode(sha256('<key>'::bytea), 'hex'),
        (SELECT id FROM auth.users WHERE email = 'skjold@hesteskokasting.no'));
```

Får du `null value in column "user_id"`, finst ikkje klubbkontoen — lag han først.

---

## 4. App configuration policy i Intune

**Apps → App configuration policies → Add → Managed devices**

### Basics

| Felt                   | Verdi                                                                  |
| ---------------------- | ---------------------------------------------------------------------- |
| Name                   | `Skjold HK`                                                            |
| Device enrollment type | Managed devices                                                        |
| Platform               | Android Enterprise                                                     |
| Profile type           | Den profiltypen einingane er meldt inn med (fully managed / dedicated) |
| Targeted app           | Hesteskokasting — **managed Google Play-oppføringa**                   |

Namngi policyen etter eininga eller klubben nøkkelen høyrer til. Du kjem til å ha ein
policy per nøkkel, og namnet er det einaste som skil dei.

**Targeted app må vere Play-oppføringa**, ikkje ein AAB du har lasta opp til Intune.
Ein slik Line-of-Business-app støttar app config berre på fully managed og dedicated,
ikkje på corporate-owned work profile — og sidan profiltypen over dekkjer alle tre,
deaktiverer Intune heile formatvalet på Settings-fana. Kjenneteiknet er ei gul
åtvaring nedst på Basics. Legg i så fall appen til på nytt via **Apps → Android →
Add → Managed Google Play app**, godkjenn og synkroniser, fjern tildelinga på
LOB-oppføringa, og lag policyen på nytt.

### Settings

La **Permissions**, **Connected apps** og **Credential Provider** stå som dei er —
appen ber ikkje om runtime-løyve, og skal korkje dele profil eller vere
passordlager.

Under **Configuration Settings → Configuration settings format**, vel ein av to:

**a) Use configuration designer** (enklast)

`Add` → hak av **Device key** → sett verditypen til `String` → lim inn nøkkelen frå
steg 3.

Dukkar ikkje `Device key` opp i lista, har ikkje managed Google Play synkronisert
skjemaet frå den nye app-versjonen enno. Vent til appen er godkjend og synkronisert,
eller bruk JSON-varianten under.

**b) Enter JSON data**

```json
{
  "kind": "androidenterprise#managedConfiguration",
  "productId": "app:no.hesteskokasting.app",
  "managedProperty": [{ "key": "deviceKey", "valueString": "<key>" }]
}
```

Nøkkelnamnet er `deviceKey` — nøyaktig slik, med stor K.

### Assignments

Tildel policyen til gruppa som inneheld akkurat dei einingane nøkkelen gjeld for.
Appen må òg vere tildelt same gruppe som **Required**, elles er det ingen app å
konfigurere.

> Tildeler du to konfigurasjonspolicyar for same app til same eining, avgjer ikkje
> Intune kven som vinn på ein måte du kan stole på. Éi eining = éin policy.

---

## 5. Verifiser

1. Start appen på tableten på nytt (eller `Sync` eininga i Intune, så tvangsavslutt appen).
2. Appen skal vere innlogga som klubbkontoen — e-posten står oppe til høgre i menyen.
3. Stadfest frå databasen:

```sql
SELECT name, active, last_login_at FROM public.kiosk_device ORDER BY last_login_at DESC NULLS LAST;
```

`last_login_at` er tidspunktet eininga sist henta ein sesjon. Står han tom, har
eininga aldri kome gjennom.

---

## 6. Trekk tilbake ei eining

```sql
UPDATE public.kiosk_device SET active = false WHERE name = 'Skjold court A';
```

Ein tablet som allereie er innlogga held sesjonen til nokon loggar ut eller
sesjonen går ut. Skal han ut med det same, fjern òg appen frå eininga via Intune.

---

## Feilsøking

| Symptom                                           | Truleg årsak                                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------------- |
| Appen opnar seg utlogga, ingenting skjer          | Gamal app-versjon på eininga, eller policyen er ikkje tildelt gruppa eininga er i |
| `Device key` manglar i configuration designer     | Managed Google Play har ikkje synkronisert skjemaet frå den nye versjonen enno    |
| `Configuration settings format` er grå og uvalbar | Targeted app er ein opplasta LOB-app, ikkje Play-oppføringa (sjå avsnitt 4)       |
| Innlogging feilar, `last_login_at` står tom       | Nøkkelen i policyen samsvarar ikkje med `key_hash`, eller `active = false`        |
| Kiosken loggar inn, men får ikkje starta stevnet  | Klubbkontoen manglar `klubbadmin`-rolle eller rad i `klubbadmin_klubber`          |

Appen loggar feilen til konsollen som `managedConfigService.deviceLogin`. Sjå den med
`adb logcat -s chromium` mot ein tablet du har USB-tilgang til.
