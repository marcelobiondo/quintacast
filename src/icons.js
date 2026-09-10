import {
  createElement,
  Calendar,
  Clock,
  Mic,
  Play
} from "lucide";

const icons = {
  calendar: Calendar,
  clock: Clock,
  mic: Mic,
  play: Play
};

export function createIcon(
  name,
  {
    size = 16,
    strokeWidth = 2,
    className = ""
  } = {}
) {
  const iconNode = icons[name];

  if (!iconNode) {
    console.warn(`Ícone "${name}" não registrado.`);
    return "";
  }

  const svg = createElement(iconNode);

  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("stroke-width", strokeWidth);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  if (className) {
    svg.setAttribute("class", className);
  }

  return svg.outerHTML;
}