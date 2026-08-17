import { createEl } from "@/utils/createEl";

/**
 * The three placeholder lines a list or page shows in place of its content:
 * a load that failed, a load in progress, and a load that returned nothing.
 * Same paragraph each time — only the class differs, and the class is what the
 * stylesheet keys on.
 */

export function createErrorBanner(message: string): HTMLParagraphElement {
  return createEl("p", message, "error-banner");
}

export function createLoadingState(message = "Laster…"): HTMLParagraphElement {
  return createEl("p", message, "loading");
}

export function createEmptyState(message: string): HTMLParagraphElement {
  return createEl("p", message, "empty-state");
}
