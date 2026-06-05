import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const IDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export function exportToExcel(groups, visibleCols, summary) {
  const wb = XLSX.utils.book_new()

  const summaryData = [
    ['BigSeller Price Analyzer - Export'],
    [],
    ['Total Qty', summary.totalQty],
    ['Total Subtotal', summary.totalSubtotal],
    ['Avg Price/Unit', summary.avgPricePerUnit],
    [],
  ]
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

  const headers = visibleCols.map(c => c.label)
  const allRows = [headers]
  for (const group of groups) {
    allRows.push([`=== ${group.key} (Qty: ${group.totalQty}) ===`])
    for (const row of group.items) {
      allRows.push(visibleCols.map(c => row[c.key] ?? ''))
    }
    allRows.push([])
  }
  const dataWs = XLSX.utils.aoa_to_sheet(allRows)
  XLSX.utils.book_append_sheet(wb, dataWs, 'Data')

  XLSX.writeFile(wb, 'bigseller-analysis.xlsx')
}

export function exportToPDF(groups, visibleCols, summary) {
  const doc = new jsPDF({ orientation: 'landscape' })

  doc.setFontSize(16)
  doc.text('BigSeller Price Analyzer', 14, 15)
  doc.setFontSize(10)
  doc.text(`Total Qty: ${summary.totalQty}   Total: ${IDR(summary.totalSubtotal)}   Avg/Unit: ${IDR(summary.avgPricePerUnit)}`, 14, 23)

  let startY = 30
  for (const group of groups) {
    doc.setFontSize(11)
    doc.setTextColor(59, 130, 246)
    doc.text(`${group.key} — Qty: ${group.totalQty} | Total: ${IDR(group.totalSubtotal)}`, 14, startY)
    startY += 4

    autoTable(doc, {
      startY,
      head: [visibleCols.map(c => c.label)],
      body: group.items.map(row => visibleCols.map(c => {
        const v = row[c.key]
        if (c.key === 'harga' || c.key === 'subtotal') return IDR(v || 0)
        return v ?? ''
      })),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
    })

    startY = doc.lastAutoTable.finalY + 8
    if (startY > 180) {
      doc.addPage()
      startY = 15
    }
  }

  doc.save('bigseller-analysis.pdf')
}
