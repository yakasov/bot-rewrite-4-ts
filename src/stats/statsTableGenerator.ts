import type { TableData } from "../types/Stats.d.ts";

export function generateTable(data: TableData[]): string {
  if (!data || data.length === 0) {
    return "No data provided.";
  }

  const headers: string[] = Object.keys(data[0]);

  const columnWidths: number[] = headers.map((header) =>
    Math.max(
      header.length,
      ...data.map((row) => {
        const value: string | number | undefined = row[header];
        return value || value === 0 ? value.toString().length : 0;
      })
    ));

  let tableString = `${headers
    .map((header: string, index: number) => {
      if (header === "★") {
        return null;
      }
      return header.padEnd(header === "Title" ? 20 : columnWidths[index] + 2);
    })
    .join("")}\n`;

  tableString += `${"-".repeat(
    columnWidths.reduce((acc, length) => acc + length, 0)
  )}\n`;

  data.forEach((item) => {
    const row: string = headers
      .map((header: string, index: number) => {
        let cellValue: string =
          item[header] !== undefined && item[header] !== null
            ? item[header].toString()
            : "";

        if (["Rep", "Msgs"].includes(header)) {
          cellValue = cellValue.padStart(columnWidths[index]);
        } else {
          cellValue = cellValue.padEnd(columnWidths[index]);
        }
        return cellValue;
      })
      .join(" ".repeat(2));
    tableString += `${row}\n`;
  });

  return tableString;
}
