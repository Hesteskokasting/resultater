## UTKAST - Plan for funksjonalitet for turneringsadmin og resultatføring

## routing

1. Alle relevante side/pages skal ha ruting, tilsvarende som for pages (ref app.js)

## Turneringsadmin - moduler

1. Dashboard
    - Totaloversikt over turneringer, kastere, klubber og annet administrativt
    - Rollestyring, for eksempel tildele roller / tilgang til andre
    - Totalstatistikk for turneringer, kastere og klubber ++
    - Tilganger: (bruker_profil.rolle)
        - admin: Full tilgang til alt
        - klubbadmin: Tilgang til å administrere turneringer/stevner, kastere og klubber som gjelder for denne klubben
        - bruker: Kan se turneringen, resultater, kamper osv. (realtime)

2. Administrere en turnering / stevne
    - Laste inn og endre turneringsinnstillinger (public.stevne)
    - Legge til / fjerne kastere
        - Legges til i public.pamelding (vurder å endre tabellnavn til startliste?)
        - Når turneringen startes overføres alle til public.resultat (FK stevneid)
    - Starte -> administrere -> ferdigstille
        - Start -> innledende -> avsluttende -> fullført (public.stevne.stevne_fase)
        - Noen turneringer har kun innledende (hele stevne). Da hopper den over "avsluttende" fase
    - Vise statistikk både underveis og etter at stevne er ferdig.

3. Hvordan foregår administrering av stevne mens det pågår
    - Når turneringen pågår vises alle kampene og resultatlisten
    - Kampene på venstre side gruppert på runde
    - Resultatlisten på høyre side
    - Etterhvert som kampene er ferdige kan resultat for denne legges inn (for eksempel 21 - 12)
        - Resultatlisten oppdateres automatisk
    - Dersom ønskelig kan også kampene åpnes for å føre detaljert resultat for hver omgang (scoring - egen modul)
        - Det er banen som må kobles til denne, slik at når kampen er ferdig på banen så kommer neste kamp på denne banen frem etterpå automatisk

4. Når turneringen settes til fullført
    - Poengsummer, plassering med mer lagres i public.resultat for gjeldende stevne og vises som det skal på hovedsiden.

## Detaljert resultatføring

1. Det skal også legges til mulighet for å føre kampene detaljert, dvs poeng/score/antall ringer i hver omgang i en kamp.
    - Implementeres senere