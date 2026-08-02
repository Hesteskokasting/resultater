// Bare date strings (YYYY-MM-DD) are parsed as UTC midnight by JS, which shifts
// the display date by one day for Norwegian users (UTC+1/+2). Use local noon instead.
export function parseLocalDate(datoStr: string): Date {
  return datoStr.length === 10 ? new Date(datoStr + "T12:00:00") : new Date(datoStr);
}
