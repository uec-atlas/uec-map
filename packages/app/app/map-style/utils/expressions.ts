import type { ExpressionSpecification } from "maplibre-gl";

export function buildMatch(
  prop: string,
  map: Record<string, string>,
  fallback: string,
): ExpressionSpecification {
  const expr: unknown[] = ["match", ["get", prop]];
  for (const [k, v] of Object.entries(map)) {
    expr.push(k, v);
  }
  expr.push(fallback);
  return expr as ExpressionSpecification;
}
