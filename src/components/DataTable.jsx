import { useState } from 'react'
import DetailModal from './DetailModal'

const IDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

function SortIcon({ active, dir }) {
  if (!active) return <span className="opacity-30">↕</span>
  return <span>{dir === 'asc' ? '↑' : '↓'}</span>
}

export default function DataTable({ groups, state, dispatch, orderedVisibleCols, allColumns }) {
  const [detailGroup, setDetailGroup] = useState(null)

  function toggleAll() {
    if (state.expandedGroups.size === groups.length) {
      dispatch({ type: 'COLLAPSE_ALL' })
    } else {
      dispatch({ type: 'EXPAND_ALL', keys: groups.map(g => g.key) })
    }
  }

  function sortByGroupField(key) {
    dispatch({ type: 'SET_GROUP_SORT', key })
  }

  const gsc = state.groupSortConfig

  if (groups.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-gray-600">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-lg font-medium">Tidak ada data ditemukan</p>
        <p className="text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
      </div>
    )
  }

  // Columns shown per-row when expanded (the selected visible cols)
  // Group header row will span those, then show 3 aggregate summary cols
  const AGGS = [
    { key: 'totalQty', label: 'Total Qty' },
    { key: 'totalSubtotal', label: 'Total Subtotal' },
    { key: 'avgPrice', label: 'Avg Harga' },
  ]

  return (
    <>
      <div className="overflow-x-auto scrollbar-thin rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              {/* Toggle all */}
              <th className="px-3 py-3 w-8 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={toggleAll}
                  className="text-xs text-blue-500 hover:underline whitespace-nowrap"
                >
                  {state.expandedGroups.size === groups.length ? '▲' : '▼'}
                </button>
              </th>

              {/* Data columns — sortable by row value */}
              {orderedVisibleCols.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 cursor-pointer select-none whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 border-b border-gray-200 dark:border-gray-700"
                  onClick={() => dispatch({ type: 'SET_SORT', key: col.key })}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon active={state.sortConfig.key === col.key} dir={state.sortConfig.dir} />
                  </span>
                </th>
              ))}

              {/* Aggregate columns — sortable by group value */}
              {AGGS.map(agg => (
                <th
                  key={agg.key}
                  className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300 cursor-pointer select-none whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 border-b border-gray-200 dark:border-gray-700 border-l border-gray-200 dark:border-gray-700"
                  onClick={() => sortByGroupField(agg.key)}
                >
                  <span className="flex items-center justify-end gap-1">
                    {agg.label}
                    <SortIcon active={gsc.key === agg.key} dir={gsc.dir} />
                  </span>
                </th>
              ))}

              <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {groups.map((group) => {
              const expanded = state.expandedGroups.has(group.key)
              return (
                <GroupRows
                  key={group.key}
                  group={group}
                  expanded={expanded}
                  orderedVisibleCols={orderedVisibleCols}
                  dispatch={dispatch}
                  onDetail={() => setDetailGroup(group)}
                />
              )
            })}
          </tbody>
        </table>
      </div>

      {detailGroup && (
        <DetailModal
          group={detailGroup}
          allColumns={allColumns}
          onClose={() => setDetailGroup(null)}
        />
      )}
    </>
  )
}

function GroupRows({ group, expanded, orderedVisibleCols, dispatch, onDetail }) {
  return (
    <>
      {/* Group header row */}
      <tr
        className="bg-blue-50 dark:bg-blue-950/40 border-t-2 border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40"
        onClick={() => dispatch({ type: 'TOGGLE_GROUP', key: group.key })}
      >
        <td className="px-3 py-2.5 text-blue-600 dark:text-blue-400 font-bold text-center">
          {expanded ? '▼' : '▶'}
        </td>

        {/* Group key spans all data columns */}
        <td
          className="px-4 py-2.5 font-semibold text-blue-700 dark:text-blue-300"
          colSpan={orderedVisibleCols.length}
        >
          <span>{group.key}</span>
          <span className="ml-2 text-xs font-normal text-blue-400 dark:text-blue-500">
            {group.items.length} transaksi
          </span>
          {group.totalQtyKilat > 0 && (
            <span className="ml-2 text-xs font-medium text-orange-500 dark:text-orange-400 bg-orange-100 dark:bg-orange-950 px-1.5 py-0.5 rounded">
              ⚡ {group.totalQtyKilat} kilat
            </span>
          )}
        </td>

        {/* Aggregate summaries — Qty Real + Kilat, Subtotal hanya real */}
        <td className="px-4 py-2.5 text-right font-semibold text-blue-700 dark:text-blue-300 whitespace-nowrap border-l border-blue-200 dark:border-blue-800">
          <span>{group.totalQtyReal.toLocaleString('id-ID')}</span>
          {group.totalQtyKilat > 0 && (
            <span className="ml-1 text-xs font-normal text-orange-500">+{group.totalQtyKilat}⚡</span>
          )}
        </td>
        <td className="px-4 py-2.5 text-right font-semibold text-blue-700 dark:text-blue-300 whitespace-nowrap border-l border-blue-200 dark:border-blue-800">
          {IDR(group.totalSubtotal)}
        </td>
        <td className="px-4 py-2.5 text-right font-semibold text-blue-700 dark:text-blue-300 whitespace-nowrap border-l border-blue-200 dark:border-blue-800">
          {IDR(group.avgPrice)}
        </td>

        <td className="px-4 py-2.5 text-center" onClick={e => e.stopPropagation()}>
          <button
            onClick={onDetail}
            className="px-3 py-1 text-xs rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
          >
            Detail
          </button>
        </td>
      </tr>

      {/* Expanded detail rows */}
      {expanded && group.items.map((row, i) => (
        <tr
          key={i}
          className={`border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30
            ${row.isPesananKilat ? 'bg-orange-50/40 dark:bg-orange-950/20' : ''}`}
        >
          <td className="px-3 py-2 border-l-2 border-blue-200 dark:border-blue-800 text-center">
            {row.isPesananKilat && <span title="Pesanan Kilat" className="text-xs">⚡</span>}
          </td>
          {orderedVisibleCols.map(col => (
            <td key={col.key} className="px-4 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {col.key === 'harga'
                ? (row.isPesananKilat ? <span className="text-orange-400 text-xs font-medium">Pesanan Kilat</span> : IDR(row[col.key] || 0))
                : col.key === 'subtotal'
                  ? (row.isPesananKilat ? <span className="text-gray-400 text-xs">—</span> : IDR(row[col.key] || 0))
                  : (row[col.key] ?? '-')}
            </td>
          ))}
          {/* Empty cells under aggregate columns */}
          <td className="border-l border-gray-100 dark:border-gray-800" />
          <td className="border-l border-gray-100 dark:border-gray-800" />
          <td className="border-l border-gray-100 dark:border-gray-800" />
          <td />
        </tr>
      ))}
    </>
  )
}
