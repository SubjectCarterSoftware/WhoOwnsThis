import type { NodeReducer } from "sigma/types";

export const nodeReducer: NodeReducer = (id, attrs) => {
  const base: any = { ...attrs };
  const visible = true; // replace with filter predicate if needed
  if (!visible) return { ...base, hidden: true };

  if (base.kind === "project") base.color = "#4f46e5";
  if (base.kind === "server") base.color = "#f59e0b";
  if (base.kind === "ticket") base.color = "#10b981";
  if (base.kind === "person") base.color = "#60a5fa";

  base.size = Math.max(14, base.size || 16);
  return base;
};

