export function safeReplaceNodeAttributes(graph: any, key: string, patch: any) {
  const curr = graph.hasNode(key) ? graph.getNodeAttributes(key) : {};
  const next = { ...curr, ...patch } as any;
  if (typeof next.x !== "number") next.x = typeof curr.x === "number" ? curr.x : Math.random();
  if (typeof next.y !== "number") next.y = typeof curr.y === "number" ? curr.y : Math.random();
  graph.replaceNodeAttributes(key, next);
}

export function safeAddNode(graph: any, key: string, attrs: any) {
  const a = { ...attrs } as any;
  if (typeof a.x !== "number") a.x = Math.random();
  if (typeof a.y !== "number") a.y = Math.random();
  if (typeof a.size !== "number") a.size = 16;
  graph.addNode(key, a);
}
