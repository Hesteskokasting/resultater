-- Tighten omgang integrity: poeng and antall_ringer must be mutually
-- possible. An omgang is 4 shoes, each scoring 5 (ringer) or 0–3 by
-- distance — so with r ringere, poeng must lie in [5r, 5r + 3*(4-r)].
-- Catches impossible entries like "20 poeng, 0 ringere" (max without
-- ringere is 12). Only enforced once ringere is recorded (NULL = the
-- ringer step hasn't been entered yet).

ALTER TABLE public.xkast_kongelag_omgang
  ADD CONSTRAINT xkast_kongelag_omgang_poeng_ringer_check
  CHECK (
    antall_ringer IS NULL
    OR poeng BETWEEN antall_ringer * 5 AND antall_ringer * 5 + (4 - antall_ringer) * 3
  );
