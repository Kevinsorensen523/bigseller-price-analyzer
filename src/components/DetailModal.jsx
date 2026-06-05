import { useEffect, useState, useMemo } from 'react'

const IDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const DETAIL_COLS = [
  { key: 'waktuPesanan', label: 'Waktu Pesanan' },
  { key: 'noPesanan', label: 'No. Pesanan' },
  { key: 'status', label: 'Status' },
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'toko', label: 'Toko' },
  { key: 'produk', label: 'Nama Produk' },
  { key: 'variasi', label: 'Variasi' },
  { key: 'sku', label: 'SKU' },
  { key: 'qty', label: 'Qty' },
  { key: 'harga', label: 'Harga Satuan' },
  { key: 'subtotal', label: 'Subtotal' },
]

export default function DetailModal({ group, onClose }) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' })

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!group) return null

  const activeCols = DETAIL_COLS.filter(col =>
    group.items.some(r => r[col.key] !== undefined && String(r[col.key]) !== '' && r[col.key] !== 0)
    || ['qty', 'subtotal', 'harga'].includes(col.key)
  )

  function toggleSort(key) {
    setSort(s => ({
      key,
      dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  const sortedItems = useMemo(() => {
    if (!sort.key) return group.items
    return [...group.items].sort((a, b) => {
      const va = a[sort.key] ?? ''
      const vb = b[sort.key] ?? ''
      const res = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))
      return sort.dir === 'asc' ? res : -res
    })
  }, [group.items, sort])

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 flex flex-col flex-1 m-3 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Detail Transaksi</h2>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">{group.key}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Transaksi: <strong className="text-gray-900 dark:text-gray-100">{group.items.length}</strong>
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Qty Real: <strong className="text-gray-900 dark:text-gray-100">{group.totalQtyReal.toLocaleString('id-ID')}</strong>
              </span>
              {group.totalQtyKilat > 0 && (
                <span className="text-orange-500 dark:text-orange-400">
                  ⚡ Kilat: <strong>{group.totalQtyKilat.toLocaleString('id-ID')}</strong>
                </span>
              )}
              <span className="text-gray-500 dark:text-gray-400">
                Subtotal: <strong className="text-green-600 dark:text-green-400">{IDR(group.totalSubtotal)}</strong>
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Avg: <strong className="text-gray-900 dark:text-gray-100">{IDR(group.avgPrice)}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Table — scrollable both axes within modal */}
        <div className="flex-1 overflow-auto min-h-0 scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 w-8 border-b border-gray-200 dark:border-gray-700">#</th>
                {activeCols.map(col => (
                  <th
                    key={col.key}
                    className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap border-b border-gray-200 dark:border-gray-700 cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => toggleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sort.key === col.key
                        ? <span className="text-blue-500">{sort.dir === 'asc' ? '↑' : '↓'}</span>
                        : <span className="opacity-30">↕</span>
                      }
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {sortedItems.map((row, i) => (
                <tr
                  key={i}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${row.isPesananKilat ? 'bg-orange-50/60 dark:bg-orange-950/20' : ''}`}
                >
                  <td className="px-3 py-2.5 text-gray-400 dark:text-gray-600 text-xs">
                    {row.isPesananKilat ? '⚡' : i + 1}
                  </td>
                  {activeCols.map(col => (
                    <td key={col.key} className="px-4 py-2.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {col.key === 'noPesanan' ? (
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          {row[col.key] || '-'}
                        </span>
                      ) : col.key === 'status' ? (
                        <StatusBadge status={row[col.key]} />
                      ) : col.key === 'waktuPesanan' ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{row[col.key] || '-'}</span>
                      ) : col.key === 'harga' ? (
                        row.isPesananKilat
                          ? <span className="text-orange-400 text-xs font-medium">Pesanan Kilat</span>
                          : IDR(row[col.key] || 0)
                      ) : col.key === 'subtotal' ? (
                        row.isPesananKilat
                          ? <span className="text-gray-400">—</span>
                          : <span className="font-semibold text-green-600 dark:text-green-400">{IDR(row[col.key] || 0)}</span>
                      ) : (
                        row[col.key] ?? '-'
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  if (!status) return <span className="text-gray-400">-</span>
  const s = status.toLowerCase()
  let cls = 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
  if (s.includes('selesai') || s.includes('complete') || s.includes('delivered')) {
    cls = 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
  } else if (s.includes('batal') || s.includes('cancel')) {
    cls = 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
  } else if (s.includes('kirim') || s.includes('ship') || s.includes('transit')) {
    cls = 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
  } else if (s.includes('bayar') || s.includes('paid') || s.includes('proses')) {
    cls = 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {status}
    </span>
  )
}
