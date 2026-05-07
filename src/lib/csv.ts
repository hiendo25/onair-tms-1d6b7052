import Papa from "papaparse";

export function exportCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns?: { key: keyof T; label: string }[]
) {
  const data = columns
    ? rows.map((r) => Object.fromEntries(columns.map((c) => [c.label, r[c.key] ?? ""])))
    : rows;
  const csv = Papa.unparse(data, { quotes: true });
  // BOM for Excel UTF-8
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCsv(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => resolve(res.data),
      error: reject,
    });
  });
}
