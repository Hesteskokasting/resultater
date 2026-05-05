## Kodekvalitet
- Skriv DRY-kode (Don't Repeat Yourself) — trekk ut gjenbrukbar logikk i funksjonar/modular
- Kvar funksjon skal ha éitt ansvar (Single Responsibility Principle)
- Gjenbruk eksisterande hjelpefunksjonar framfor å skrive ny kode som gjer det same

## Struktur
- Legg delt logikk i `src/utils/` eller tilsvarande delt modul
- Bruk arv/komposisjon/mixins framfor copy-paste av åtferd

## GIT
- Ikkje stage, lag commit, push, pull osv med mindre eg ber om det spesifikt

## CSS
- All css skal være i .css filer. Ikke bruk css i javascript-filer, med mindre det er høgst nødvendig.