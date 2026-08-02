export const DEFAULT_PAGE_TITLE = "NHF Resultater";

export function setPageTitle(title?: string): void {
  document.title = title ? title : DEFAULT_PAGE_TITLE;
}
