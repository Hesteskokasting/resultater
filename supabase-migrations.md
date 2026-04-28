## Legg til nye nødvendige tabellar/kolonner - TODO
## Aktiver database migrations

Steg 1: Installer Supabase CLI

npm install supabase --save-dev

Steg 2: Koble til prosjektet ditt

npx supabase login
npx supabase init          # lagar supabase/-mappe i prosjektet ditt
npx supabase link --project-ref DIN_PROJECT_REF

Slik lagar du ein ny migrasjon:

npx supabase migration new legg_til_betaling

Køyr migrasjonen mot Supabase:

npx supabase db push

.gitignore
supabase/.temp/
supabase/seed.sql