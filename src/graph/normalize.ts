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

  // Resolve custom avatar image scheme to a concrete, fetchable URL.  The
  // sample graph uses values such as `avatar:eli` for the `image` attribute.
  // Browsers treat the `avatar:` protocol as an invalid scheme and block the
  // request, resulting in CORS errors.  To make these images load properly we
  // transform any `avatar:NAME` value into a DiceBear avatar URL which is
  // served with permissive CORS headers.
  if (typeof out.image === "string" && out.image.startsWith("avatar:")) {
    const seed = encodeURIComponent(out.image.slice("avatar:".length));
    out.image = `https://api.dicebear.com/6.x/thumbs/png?seed=${seed}`;
  }

  return out as GraphNodeAttrs;
}
