-- Tighten nullability on columns that are always populated in practice and whose
-- absence would indicate a data-integrity bug rather than a valid application state.
-- Verified against production data (0 existing nulls) and confirmed via code review
-- that every write path always supplies a value for these columns.

alter table public.kamp_omgang
  alter column score set not null,
  alter column antall_ringer set not null;

alter table public.stevne
  alter column dato set not null;

alter table public.resultat
  alter column hcp set not null;
