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

For Supabase-migrering — når du oppretter prod-prosjektet seinare, legg dette til i deploy-prod.yml etter npm ci og før npm run build:


      - name: Apply Supabase migrations
        run: npx supabase db push --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
Secrets du treng i github-pages-environmentet då:

SUPABASE_PROJECT_REF — project ref frå supabase.com (8-teikns ID)
SUPABASE_ACCESS_TOKEN — frå supabase.com → Account → Access tokens
For dev-environmentet kan du gjere det same med dev-prosjektets SUPABASE_PROJECT_REF. For tida er dette ikkje nødvendig sidan du køyrer migrering lokalt med supabase db push manuelt