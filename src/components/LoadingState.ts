export function createLoadingState(message = "Laster…"): HTMLParagraphElement {
  const p = document.createElement("p");
  p.className = "loading";
  p.textContent = message;
  return p;
}
