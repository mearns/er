export function isObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object";
}

export function hasStack(e: unknown): e is { stack: string } {
  return (
    isObject(e) &&
    Object.hasOwnProperty.call(e, "stack") &&
    typeof e.stack === "string"
  );
}
