import { createEl } from "@/utils/createEl";
import { padKey, padRegister, type PadShell } from "@/components/numberpad/numberpadUi";
import { ringOptions, OMGANG_MAX_RINGER } from "@/utils/xkastKongelag/omgangValidation";

/**
 * Second stage of an omgang entry: how many of the poengsum's shoes were
 * ringer. Counts the shoe model rules out are disabled, and the register
 * action names both figures. Stateless — the pad owns the pick.
 */

export interface RingStage {
  /** Poengsum being confirmed — decides which ring counts are possible. */
  poeng: number;
  selected: number | null;
  isSaving: boolean;
  onPick: (count: number) => void;
  onRegister: () => void;
}

/** Same key as a digit — the count alone, no unit spelled out beside it. */
function ringButtonEl(count: number, isAllowed: boolean, stage: RingStage): HTMLButtonElement {
  const btn = padKey(
    { label: String(count), disabled: !isAllowed, onClick: () => stage.onPick(count) },
    `pad-ring-btn${count === 0 ? " pad-ring-zero" : ""}`,
  );
  btn.setAttribute("aria-label", count === 1 ? "1 ring" : `${count} ringar`);
  const isSelected = stage.selected === count;
  btn.setAttribute("aria-pressed", String(isSelected));
  btn.classList.toggle("selected", isSelected);
  if (isSelected) btn.appendChild(createEl("span", "✓ Valgt", "pad-ring-valgt"));
  return btn;
}

/** Spells out what is about to be saved: poeng, then ring count. */
function registerLabel(stage: RingStage): string {
  if (stage.isSaving) return "Lagrer…";
  const ringer = stage.selected;
  if (ringer == null) return "Vel antall ringer";
  return `Registrer ${stage.poeng} p – ${ringer} ${ringer === 1 ? "ring" : "ringar"} ✓`;
}

/** Heading and keys in the body, the register action in the footer. */
export function renderRingStage({ body, footer }: PadShell, stage: RingStage): void {
  const { allowed } = ringOptions(stage.poeng);

  const heading = createEl("div", null, "pad-ring-heading");
  heading.append(
    createEl("span", "Antall ringer", "pad-ring-heading-main"),
    createEl("span", `(maks ${OMGANG_MAX_RINGER})`, "pad-ring-heading-sub"),
  );

  const grid = createEl("div", null, "pad-ring-grid");
  for (let count = 1; count <= OMGANG_MAX_RINGER; count++) {
    grid.appendChild(ringButtonEl(count, allowed.includes(count), stage));
  }
  grid.appendChild(ringButtonEl(0, allowed.includes(0), stage));

  body.append(heading, grid);
  footer.appendChild(
    padRegister({
      label: registerLabel(stage),
      disabled: stage.selected == null || stage.isSaving,
      onClick: stage.onRegister,
    }),
  );
}
