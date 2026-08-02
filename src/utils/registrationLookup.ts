import type { RegistrationStatusRow } from "@/services/pameldingService";

export interface RegistrationLookup {
  registeredMap: Map<number, boolean>;
  pairedIds: Set<number>;
}

export function buildRegistrationLookup(rows: RegistrationStatusRow[]): RegistrationLookup {
  const registeredMap = new Map<number, boolean>();
  const pairedIds = new Set<number>();
  for (const p of rows) {
    if (p.kasterid != null) {
      registeredMap.set(p.kasterid, p.er_bekreftet ?? false);
      if (p.lag_id != null) pairedIds.add(p.kasterid);
    }
  }
  return { registeredMap, pairedIds };
}
