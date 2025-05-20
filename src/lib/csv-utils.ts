
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

export function parseCSVToArray(csvString: string): Record<string, any>[] {
  if (!csvString || csvString.trim() === "") {
    return [];
  }

  const lines = csvString.trim().split('\n');
  if (lines.length === 0) {
    return [];
  }

  const parseCsvRow = (row: string): string[] => {
    const result: string[] = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        if (inQuotes && i + 1 < row.length && row[i+1] === '"') {
          // Escaped quote " "
          currentField += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(currentField); // Keep leading/trailing spaces within unquoted fields for now, trim later
        currentField = '';
      } else {
        currentField += char;
      }
    }
    result.push(currentField); // Add last field
    // Trim fields and remove surrounding quotes if they are not part of an escaped quote sequence
    return result.map(field => field.trim().replace(/^"(.*)"$/, '$1').replace(/""/g, '"'));
  };
  
  const headers = parseCsvRow(lines[0]);
  // Filter out empty headers that might result from trailing commas
  const validHeaders = headers.filter(header => header.trim() !== '');

  if (validHeaders.length === 0) {
      return []; // No valid headers
  }

  const dataArray: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue; // Skip empty lines
    
    const values = parseCsvRow(lines[i]);
    
    // Only consider up to the number of valid headers
    if (values.length >= validHeaders.length) {
      const obj: Record<string, any> = {};
      validHeaders.forEach((header, index) => {
        obj[header] = values[index] !== undefined ? values[index] : '';
      });
      dataArray.push(obj);
    } else if (values.every(val => val.trim() === '')) {
      // If all values are empty, skip the row (often happens with trailing newlines)
      continue;
    }
    else {
      // If there's a mismatch but some values exist, try to map what we can, or log a warning
      const obj: Record<string, any> = {};
      validHeaders.forEach((header, index) => {
        obj[header] = values[index] !== undefined ? values[index] : '';
      });
      dataArray.push(obj); // Add partial row
      console.warn(`CSV row ${i+1} has ${values.length} columns, but ${validHeaders.length} headers. Row content: ${lines[i]}. Partial data mapped.`);
    }
  }
  return dataArray;
}
