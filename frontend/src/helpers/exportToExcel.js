import * as XLSX from 'xlsx';

export function exportFacturesToExcel(factures) {
  const worksheet = XLSX.utils.json_to_sheet(factures);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Factures');

  XLSX.writeFile(workbook, 'factures.xlsx');
}
