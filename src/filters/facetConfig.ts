export const NODE_FACET_CANDIDATES = [
  "kind", "type", "status", "team", "owner", "domain", "category", "tags"
] as const;

export const EDGE_FACET_CANDIDATES = [
  "relationship_type"
] as const;

export const IGNORE_KEYS = ["x", "y", "size", "color", "label", "hidden", "key", "id"];

