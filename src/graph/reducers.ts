import type { NodeReducer } from "sigma/types";

export const nodeReducer: NodeReducer = (id, attrs) => {
  const base = { ...attrs } as any;
  const visible = true;
  return visible ? base : { ...base, hidden: true };
};
