export function createEnum<T extends readonly string[]>(values: T) {
  return Object.freeze(
    Object.fromEntries(values.map(v => [v.toUpperCase(), v])) as {
      [K in Uppercase<T[number]>]: T[number];
    }
  );
}
