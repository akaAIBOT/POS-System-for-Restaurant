import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ExportMenu({ data, filename = 'export', columns = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    setIsOpen(false);
  };

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    setIsOpen(false);
  };

  const exportToPDF = () => {
    // Simple print to PDF
    window.print();
    setIsOpen(false);
  };

  const exportToJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-lg"
      >
        <span>📥</span>
        <span>Eksportuj</span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 py-2 border border-gray-200">
            <button
              onClick={exportToExcel}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition"
            >
              <span className="text-2xl">📊</span>
              <div>
                <div className="font-medium text-gray-900">Excel</div>
                <div className="text-xs text-gray-500">Format .xlsx</div>
              </div>
            </button>
            <button
              onClick={exportToCSV}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition"
            >
              <span className="text-2xl">📄</span>
              <div>
                <div className="font-medium text-gray-900">CSV</div>
                <div className="text-xs text-gray-500">Format .csv</div>
              </div>
            </button>
            <button
              onClick={exportToPDF}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition"
            >
              <span className="text-2xl">📕</span>
              <div>
                <div className="font-medium text-gray-900">PDF</div>
                <div className="text-xs text-gray-500">Drukuj jako PDF</div>
              </div>
            </button>
            <button
              onClick={exportToJSON}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition"
            >
              <span className="text-2xl">🔧</span>
              <div>
                <div className="font-medium text-gray-900">JSON</div>
                <div className="text-xs text-gray-500">Format .json</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
