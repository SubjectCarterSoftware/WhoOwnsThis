import type { GraphNodeAttrs, NodeVariant, NodeShape } from "./types";

const SHAPE_BY_KIND: Record<string, NodeShape> = {
  person: "image",
  team: "circle",
  project: "square",
  ticket: "circle",
  server: "square",
  process: "circle",
};

const VARIANT_BY_KIND: Record<string, NodeVariant> = {
  person: "circle.person",
  project: "square.header",
  ticket: "square.accentProgress",
  server: "square.cornerTag",
  process: "square.header",
  team: "plain",
};

export function normalizeNode(n: any): GraphNodeAttrs {
  const out: any = { ...n };

  if (!out.kind && typeof out.type === "string" && !["circle", "square", "image"].includes(out.type))
    out.kind = out.type;

  out.shape = (out.shape || out.base || SHAPE_BY_KIND[out.kind] || "circle") as NodeShape;
  out.variant = (out.variant || VARIANT_BY_KIND[out.kind] || "plain") as NodeVariant;

  out.size = Math.max(14, Number(out.size ?? 16));
  if (typeof out.x !== "number") out.x = Math.random();
  if (typeof out.y !== "number") out.y = Math.random();

  out.ui = out.ui || {};

  return out as GraphNodeAttrs;
}
