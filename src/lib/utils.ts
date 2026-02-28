import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a CSV string from an array of objects.
 * @param rows Array of data objects
 * @param columns Array of { key, header } defining which fields to include
 * @returns CSV string with headers
 */
export function generateCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: string; header: string }[]
): string {
  const escape = (val: unknown): string => {
    const str = val === null || val === undefined ? "" : String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((c) => escape(c.header)).join(",");
  const body = rows
    .map((row) =>
      columns.map((c) => escape(c.key.includes(".") ? c.key.split(".").reduce((o: unknown, k) => (o as Record<string, unknown>)?.[k], row) : row[c.key])).join(",")
    )
    .join("\n");

  return `${header}\n${body}`;
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCsv(csvContent: string, filename: string) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
