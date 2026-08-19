let _container: HTMLElement | null = null;

function getContainer(): HTMLElement {
  if (!_container) {
    _container = document.createElement("div");
    _container.id = "toast-container";
    document.body.appendChild(_container);
  }
  return _container;
}

export function showToast(
  message: string,
  type: "error" | "success" | "info" | "warning" = "info",
  persistent = false,
  onClick?: () => void,
): void {
  const el = document.createElement("div");
  el.className = `toast-item toast-${type}`;
  el.textContent = message;
  el.addEventListener("click", () => {
    el.remove();
    onClick?.();
  });
  getContainer().appendChild(el);
  if (!persistent)
    setTimeout(() => {
      el.remove();
    }, 4000);
}
