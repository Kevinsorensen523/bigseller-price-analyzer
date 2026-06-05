import { useState } from 'react'
import { exportToExcel, exportToPDF } from '../utils/exportUtils'

export default function ExportMenu({ groups, orderedVisibleCols, summary }) {
  const [open, setOpen] = useState(false)

  function handleExcel() {
    exportToExcel(groups, orderedVisibleCols, summary)
    setOpen(false)
  }

  function handlePDF() {
    exportToPDF(groups, orderedVisibleCols, summary)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
            <button
              onClick={handleExcel}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <span>📊</span> Export Excel
            </button>
            <button
              onClick={handlePDF}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800"
            >
              <span>📄</span> Export PDF
            </button>
          </div>
        </>
      )}
    </div>
  )
}
