import L from "leaflet";

type PinOpts = {
  fill: string;
  label?: string;
};

function svgPin({ fill, label }: PinOpts) {
  const safeLabel = (label ?? "").slice(0, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="46" viewBox="0 0 32 46">
  <path d="M16 45s14-15.4 14-28A14 14 0 1 0 2 17c0 12.6 14 28 14 28z" fill="${fill}"/>
  <circle cx="16" cy="16" r="6" fill="#ffffff" fill-opacity="0.92"/>
  <text x="16" y="19.5" text-anchor="middle" font-size="10" font-family="ui-sans-serif,system-ui,Segoe UI,Roboto,Arial" font-weight="700" fill="${fill}">${safeLabel}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function createPinIcon(opts: PinOpts) {
  return new L.Icon({
    iconUrl: svgPin(opts),
    iconSize: [32, 46],
    iconAnchor: [16, 45],
    popupAnchor: [0, -38],
  });
}

export const pickupPinIcon = createPinIcon({ fill: "#16a34a", label: "P" });
export const deliveryPinIcon = createPinIcon({ fill: "#f97316", label: "D" });
export const agentPinIcon = createPinIcon({ fill: "#2563eb", label: "A" });

