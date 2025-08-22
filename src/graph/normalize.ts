export type InNode = Record<string, any>;
export type OutNode = Record<string, any>;

const SHAPE_BY_KIND: Record<string, "circle" | "square" | "image"> = {
  person: "image", // if image atlas used; else "circle"
  team: "circle",
  project: "square",
  ticket: "circle",
  server: "square",
  process: "circle",
};

export function normalizeNode(n: InNode): OutNode {
  const out: OutNode = { ...n };

  const kind = String(out.kind || "").toLowerCase();

  if (typeof out.shape !== "string") {
    if (
      typeof out.type === "string" &&
      ["circle", "square", "image"].includes(out.type)
    ) {
      out.shape = out.type;
    } else {
      out.shape = SHAPE_BY_KIND[kind] || "circle";
    }
  }

  if (!kind && typeof out.type === "string" && !["circle", "square", "image"].includes(out.type)) {
    out.kind = out.type.toLowerCase();
  }

  // Remove legacy type field
  delete (out as any).type;

  out.size = Math.max(14, Number(out.size ?? 14));

  if (typeof out.x !== "number") out.x = Math.random();
  if (typeof out.y !== "number") out.y = Math.random();

  return out;
}
