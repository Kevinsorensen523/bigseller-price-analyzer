export function groupData(rows, groupKey) {
  const groups = {}
  for (const row of rows) {
    const key = row[groupKey] || '(Tanpa ' + groupKey + ')'
    if (!groups[key]) groups[key] = []
    groups[key].push(row)
  }
  return Object.entries(groups).map(([key, items]) => {
    const realItems = items.filter(r => !r.isPesananKilat)
    const kilatItems = items.filter(r => r.isPesananKilat)
    const totalSubtotal = realItems.reduce((s, r) => s + (r.subtotal || 0), 0)
    const totalQtyReal = realItems.reduce((s, r) => s + (r.qty || 0), 0)
    const totalQtyKilat = kilatItems.reduce((s, r) => s + (r.qty || 0), 0)
    return {
      key,
      items,
      totalQty: totalQtyReal + totalQtyKilat,
      totalQtyReal,
      totalQtyKilat,
      totalSubtotal,
      avgPrice: totalQtyReal > 0 ? totalSubtotal / totalQtyReal : 0,
    }
  })
}

export function computeSummary(rows) {
  const realRows = rows.filter(r => !r.isPesananKilat)
  const kilatRows = rows.filter(r => r.isPesananKilat)
  const totalQtyReal = realRows.reduce((s, r) => s + (r.qty || 0), 0)
  const totalQtyKilat = kilatRows.reduce((s, r) => s + (r.qty || 0), 0)
  const totalSubtotal = realRows.reduce((s, r) => s + (r.subtotal || 0), 0)
  return {
    rowCount: rows.length,
    totalQty: totalQtyReal + totalQtyKilat,
    totalQtyReal,
    totalQtyKilat,
    totalSubtotal,
    avgPricePerUnit: totalQtyReal > 0 ? totalSubtotal / totalQtyReal : 0,
  }
}
