-- Only a brukar may be linked to a thrower (#64). Admins and klubbadmins are
-- organizers, never participants, so they can neither hold a link nor have a
-- request pending. 'avvist' with no thrower ids is left alone: it carries none.

-- Existing links on organizer rows would make the check fail to add.
UPDATE public.bruker_profil
SET kasterid = NULL, kobling_kasterid = NULL, kobling_status = 'ingen'
WHERE rolle <> 'bruker'
  AND (
    kasterid IS NOT NULL
    OR kobling_kasterid IS NOT NULL
    OR kobling_status IN ('godkjent', 'venter')
  );

ALTER TABLE public.bruker_profil
  ADD CONSTRAINT bruker_profil_kobling_berre_bruker CHECK (
    rolle = 'bruker'
    OR (
      kasterid IS NULL
      AND kobling_kasterid IS NULL
      AND kobling_status IN ('ingen', 'avvist')
    )
  );
