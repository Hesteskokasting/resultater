interface RemoveButtonProps {
  title?: string;
  onClick: () => void;
  /** 'solid' is the filled red circle (default); 'quiet' is a grey ✕ that reddens on hover */
  variant?: "solid" | "quiet";
}

export function createRemoveButton({
  title = "Fjern",
  onClick,
  variant = "solid",
}: RemoveButtonProps): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.innerHTML = "&times;";
  btn.className =
    variant === "quiet"
      ? "btn btn-sm p-0 lh-1 remove-btn-quiet"
      : "btn btn-sm rounded-circle p-0 lh-1 remove-btn";
  btn.title = title;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  return btn;
}
