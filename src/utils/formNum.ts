export function formNum(value: FormDataEntryValue | null): number | null {
  if (!value || typeof value !== "string") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
