export function sanitizeNodeAttributes(data: Record<string, any>) {
  const { type, ...rest } = data;
  return rest;
}

export function sanitizeEdgeAttributes(data: Record<string, any>) {
  const { type, ...rest } = data;
  return rest;
}
