export function toCSV(headers, rows) {
  const escape = (v) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;

  const headerLine = headers.join(",");
  const lines = rows.map(row =>
    headers.map(h => escape(row[h])).join(",")
  );

  return [headerLine, ...lines].join("\n");
}