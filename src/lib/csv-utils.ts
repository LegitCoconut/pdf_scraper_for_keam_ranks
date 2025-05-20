
export function convertToCSV(data: Record<string, any>[]): string {
  if (!data || data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Add header row, escaping headers as well
  csvRows.push(headers.map(header => {
    const escapedHeader = ('' + header).replace(/"/g, '""');
    if (escapedHeader.includes(',') || escapedHeader.includes('\n') || escapedHeader.includes('"')) {
      return `"${escapedHeader}"`;
    }
    return escapedHeader;
  }).join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      let cellValue = row[header];
      if (cellValue === null || cellValue === undefined) {
        cellValue = '';
      } else if (typeof cellValue === 'object') {
        // Stringify objects/arrays found in cells
        cellValue = JSON.stringify(cellValue);
      } else {
        cellValue = String(cellValue);
      }
      
      const escaped = cellValue.replace(/"/g, '""');
      // Enclose in quotes if it contains comma, newline, or quote
      if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
        return `"${escaped}"`;
      }
      return escaped;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

export function downloadCSV(csvString: string, filename: string): void {
  if (typeof window === "undefined") {
    console.error("Download CSV function called in a non-browser environment.");
    return;
  }

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup: remove the link and revoke the object URL after a delay
  setTimeout(() => {
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 100);
}
