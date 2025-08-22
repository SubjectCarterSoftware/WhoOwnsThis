import type { GraphNodeAttrs } from "./types";

export function normalizeNode(n: any): GraphNodeAttrs {
  const out: any = { ...n };

  // Kind (domain) if old files used "type" for that:
  if (!out.kind && typeof out.type === "string" && !["circle", "square", "image"].includes(out.type)) {
    out.kind = out.type;
  }

  // Base shape (vector-only)
  const shapeByKind: Record<string, "circle" | "square"> = {
    person: "circle",
    team: "circle",
    project: "square",
    ticket: "square",
    server: "square",
    process: "square",
  };
  const incomingShape = out.shape || out.type;
  out.shape = incomingShape === "image"
    ? "circle"
    : (incomingShape && ["circle", "square"].includes(incomingShape)
        ? incomingShape
        : shapeByKind[out.kind] || "circle");

  // Variant by kind (unchanged)
  const variantByKind: Record<string, string> = {
    person: "circle.person",
    project: "square.header",
    server: "square.cornerTag",
    ticket: "square.accentProgress",
    process: "square.header",
    team: "plain",
  };
  out.variant = out.variant || variantByKind[out.kind] || "plain";

  // Essentials
  out.size = Math.max(14, Number(out.size ?? 16));
  if (typeof out.x !== "number") out.x = Math.random();
  if (typeof out.y !== "number") out.y = Math.random();
  out.ui = out.ui || {};

  // Helpful monogram default for circle.person
  if (out.variant === "circle.person" && !out.ui.iconText && out.label) {
    const parts = String(out.label).trim().split(/\s+/);
    out.ui.iconText = (parts[0]?.[0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
  }

  return out as GraphNodeAttrs;
}

