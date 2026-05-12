/** Matches frontend pet forms: `color` is stored as option id ("1"…), not label. */

const PET_COLOR_BY_ID: Record<string, string> = {
  "1": "Black",
  "2": "Brown",
  "3": "Grey",
  "4": "Other",
};

function isUnsetPlaceholder(s: string): boolean {
  const t = s.trim();
  return t === "" || t === "—" || t === "-" || t === "–";
}

/** Map stored DB value to readable color (id → label, or passthrough text). */
export function displayPetColor(stored: unknown): string {
  if (stored == null) return "—";
  const s = String(stored).trim();
  if (isUnsetPlaceholder(s)) return "—";
  const label = PET_COLOR_BY_ID[s];
  if (label != null) return label;
  return s;
}
